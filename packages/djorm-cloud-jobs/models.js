const { DatabaseModel, Field } = require('djorm/models')
const { publishMessage, resolveTopic } = require('./pubsub')
const { getSettings } = require('djorm/config')
const { RetryError, SpawnError } = require('./errors')
const { serialize } = require('djorm/filters')
const {
  BooleanField,
  CharField,
  DateTimeField,
  ForeignKey,
  JsonField,
  PositiveIntegerField
} = require('djorm/fields')

/** Enum of all possible job states
 * @type object
 * @prop trigger {string} Job has been triggered, but nothing has been done yet.
 * @prop request {string} Job has been requested and is currently being processed.
 * @prop stopped {string} Job has been stopped. Some processes might still be finishing up, but nothing new will be started.
 * @prop success {string} Job main process was successful.
 * @prop failure {string} Job main process failed.
 */
const JobStatus = {
  trigger: 'trigger',
  request: 'request',
  stopped: 'stopped',
  success: 'success',
  failure: 'failure'
}

/** Descriptor for running jobs
 * @prop filter {string[]} Enum of status values for running job
 * @prop status {string} Status identifier
 * @type {string[]}
 */
const JobRunning = {
  filter: [JobStatus.trigger, JobStatus.request],
  status: 'running'
}

/** Enum of all possible job handler names
 * @type object
 */
const JobStatusHandler = {
  [JobStatus.trigger]: 'onTrigger',
  [JobStatus.request]: 'onRequest',
  [JobStatus.success]: 'onSuccess',
  [JobStatus.failure]: 'onFailure'
}

const sum = numbers => numbers.reduce((aggr, num) => aggr + num)

class JobBase extends DatabaseModel {
  static Status = JobStatus
  static Running = JobRunning
  static StatusHandler = JobStatusHandler

  static id = new PositiveIntegerField()

  static checksum = new CharField({
    default: inst => inst.constructor.getChecksum(inst.type, inst.props)
  })

  static parent = new ForeignKey({
    model: 'Job',
    parentModel: 'Job',
    keyField: 'parentId',
    keyFieldType: CharField,
    relatedName: 'children'
  })

  static root = new ForeignKey({
    model: 'Job',
    parentModel: 'Job',
    keyField: 'rootId',
    keyFieldType: CharField,
    relatedName: 'descendants'
  })

  static topic = new CharField({ default: inst => resolveTopic(inst.type) })
  static type = new CharField()
  static live = new BooleanField({ default: true })
  static status = new CharField({ default: JobStatus.trigger })
  static retried = new PositiveIntegerField({ default: 0 })
  static maxRetries = new PositiveIntegerField({ default: 3 })
  static props = new JsonField()
  static createdAt = new DateTimeField({ default: () => new Date() })
  static updatedAt = new DateTimeField({ default: () => new Date() })
  static childStats = new Field()
  static descendantStats = new Field()

  static meta = class {
    static abstract = true
  }

  static async debounce (jobProps) {
    const Model = this
    const job = new Model(jobProps)
    const existing = await this.objects
      .filter({ checksum: this.getChecksum(job.type, job.props), live: true })
      .orderBy('-createdAt')
      .first()
    return existing && existing.live ? existing : await job.save()
  }

  static getChecksum (type, props) {
    return require('crypto')
      .createHash('sha1')
      .update(`${type}-${JSON.stringify(props)}`)
      .digest('hex')
  }

  constructor (...args) {
    super(...args)
    this.childrenIds = []
  }

  static formatStats (numbers) {
    return numbers.reduce(
      (aggr, row) => ({ ...aggr, [row.status]: sum(row.sums) }),
      {}
    )
  }

  static async fetchJobStats (filter) {
    return await Promise.all(
      Object.values(JobStatus).map(async status => {
        const query = this.objects.query
        return {
          status,
          sums: await Promise.all([query.filter({ status, ...filter }).count()])
        }
      })
    )
  }

  async fetchStats () {
    const promises = []
    promises.push(this.constructor.fetchJobStats({ parentId: this.id }))
    if (!this.rootId) {
      promises.push(this.constructor.fetchJobStats({ rootId: this.id }))
    }

    // Fetch stats in parallel, datastore can handle it
    const [childNumbers, descendantNumbers] = await Promise.all(promises)
    this.childStats = this.constructor.formatStats(childNumbers)
    if (descendantNumbers) {
      this.descendantStats = this.constructor.formatStats(descendantNumbers)
    }
    return this
  }

  async create (preventSpawn = false) {
    await super.create()
    if (
      this.get('status') === this.constructor.Status.trigger &&
      !preventSpawn
    ) {
      await this.spawn()
    }
    return this
  }

  async update () {
    this.updatedAt = new Date()
    return await super.update()
  }

  async spawn () {
    if (!this.pk) {
      throw new SpawnError('Cannot spawn job without ID.')
    }
    const message = serialize(this)
    if (getSettings().jobs.local) {
      const { runLocalJob } = require('./localRunner')
      await runLocalJob(this.get('topic'), message)
    } else {
      await publishMessage(this.get('topic'), message)
    }
    return this
  }

  async spawnChild (jobProps) {
    const childJob = new Job({
      ...jobProps,
      status: JobStatus.trigger,
      props: {
        ...this.props,
        ...jobProps.props
      },
      topic: jobProps.topic || this.topic,
      rootId: this.rootId || this.parentId || this.id,
      parentId: this.id
    })
    await childJob.save()
    this.childrenIds.push(childJob.id)
    return childJob
  }

  async save () {
    this.live = JobRunning.filter.includes(this.get('status'))
    return await super.save()
  }

  async stop () {
    this.status = JobStatus.stopped
    // @TODO: Stop descendants
    // @TODO: Stop ancestors?
    // @TODO: Terminate execution
    return await this.save()
  }

  async retry () {
    if (this.get('retried') < this.get('maxRetries')) {
      this.retried = (this.retried || 0) + 1
      this.status = JobStatus.trigger
      await this.update()
      return await this.spawn()
    }
    throw new RetryError(`Job#${this.pk} has reached it's retry limit`)
  }
}

class Job extends JobBase {}

Job.register()
JobBase.register()

module.exports = {
  Job,
  JobBase,
  JobRunning,
  JobStatus,
  JobStatusHandler
}
