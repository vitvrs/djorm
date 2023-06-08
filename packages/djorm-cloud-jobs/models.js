const logger = require('djorm/logger')

const { publishMessage, resolveTopic } = require('./pubsub')
const { getSettings } = require('djorm/config')
const { RetryError, SpawnError } = require('./errors')
const { serialize } = require('djorm/filters')
const {
  DatabaseModel,
  Field,
  ObjectManager,
  getModelName,
  SELF
} = require('djorm/models')
const {
  AutoField,
  BooleanField,
  CharField,
  DateTimeField,
  ForeignKey,
  JsonField,
  PositiveIntegerField
} = require('djorm/fields')

/** This is the format of a database row pulled when counting job stats
 * @typedef {object} JobStatsRow
 * @prop {JobStatus} status
 * @prop {int} sums
 */

/** Job stats formatted for convenient access. Properties are named after
 * {JobStatus} and typed as {int}
 * @typedef {object} JobStats
 * @link {JobStatus}
 */

/** Enum of all possible job states
 * @readonly
 * @enum {string}
 */
const JobStatus = {
  /** @type {string} Job has been triggered, but nothing has been done yet */
  trigger: 'trigger',
  /** @type {string} Job has been requested and is currently being processed */
  request: 'request',
  /** @type {string} Job is waiting for it's children or external children
   *   to finish, so it is still considered live.
   */
  waiting: 'waiting',
  /** @type {string} Job has been stopped. Some processes might still be
   *   finishing up, but nothing new will be started
   */
  stopped: 'stopped',
  /** @type {string} Job main process was successful */
  success: 'success',
  /** @type {string} Job main process failed */
  failure: 'failure'
}

/** Descriptor for running jobs
 * @prop filter {string[]} Enum of status values for running job
 * @prop status {string} Status identifier
 * @type {string[]}
 */
const JobRunning = {
  filter: [JobStatus.trigger, JobStatus.request, JobStatus.waiting],
  status: 'running'
}

/** Enum of all possible job handler names
 * @enum {string}
 */
const JobStatusHandler = {
  [JobStatus.trigger]: 'onTrigger',
  [JobStatus.request]: 'onRequest',
  [JobStatus.success]: 'onSuccess',
  [JobStatus.failure]: 'onFailure'
}

const sum = numbers => numbers.reduce((aggr, num) => aggr + num)

class JobManager extends ObjectManager {
  get expired () {
    return this.query.filter({
      expiresAt__lte: new Date(),
      live: true
    })
  }
}

/** Base class for jobs
 * @abstract
 * @augments {DatabaseModel}
 */
class JobBase extends DatabaseModel {
  static manager = JobManager
  /** @type {int} id Primary unique identifier of the job */
  static id = new AutoField()

  /** @type {string} checksum Props and type checksum, useful to find identical
   *   jobs by querying the database. */
  static checksum = new CharField({
    default: inst => inst.constructor.getChecksum(inst.type, inst.props)
  })

  /** @type {JobBase} parent Parent job foreign key */
  static parent = new ForeignKey({
    model: SELF,
    keyField: 'parentId',
    null: true,
    relatedName: 'children'
  })

  /** @type {JobBase} parent Root job foreign key */
  static root = new ForeignKey({
    model: SELF,
    keyField: 'rootId',
    null: true,
    relatedName: 'descendants'
  })

  /** @type {string} topic The topic on which will the job be communicated.
   *   This topic must be configured in the used communication system. Job
   *   topic must always be present in cloudJobs configuration routing to
   *   secure that child jobs are spawned on the same topic.
   *  @example 'scrape-users'
   *  @example 'scrape-pets'
   *  */
  static topic = new CharField({ default: inst => resolveTopic(inst.type) })

  /** @type {string} topic Job type is used to identify a specific workflow
   *   It can be used to split large workloads into smaller pieces that can
   *   be run in parallel. For example, fetching users can be split into
   *
   *   1. fetching user list to get list of API listing pages,
   *   2. fetching a API listing page by URL
   *   3. fetching user detail by URL
   *  @example 'user:fetch:list:overview'
   *  @example 'user:fetch:list:page'
   *  @example 'user:fetch:profile'
   */
  static type = new CharField()

  /** @type {boolean} live Automatically calculated value describing it the job
   *   is still alive or not. Living jobs are expected to produce some
   *   computation or results. Job is alive given the status is `trigger` or
   *   `request`, otherwise it's not.
   */
  static live = new BooleanField({ default: true })

  /** @type {JobStatus} status Job status */
  static status = new CharField({
    default: JobStatus.trigger,
    choices: Object.values(JobStatus)
  })

  /** @type {int} retried How many times was this job retried */
  static retried = new PositiveIntegerField({ default: 0 })

  /** @type {int} maxAge Maximum job age in minuts. It should be terminated after. */
  static maxAge = new PositiveIntegerField({ default: 240 })

  /** @type {int} maxRetries Maximum number of retry attempts */
  static maxRetries = new PositiveIntegerField({ default: 3 })

  /** @type {object} props Job props as a JSON object. This field is stored
   *   in the jobs database. */
  static props = new JsonField({ null: true })

  /** @type {object} output Job outputs as JSON object. This field is stored
   *  in the jobs database. */
  static output = new JsonField({ null: true })

  /**
   * @type {Date} createdAt When was this job created?
   * @default 'now' */
  static createdAt = new DateTimeField({ default: () => new Date() })

  /** @type {Date} updatedAt When was this job last updated? */
  static updatedAt = new DateTimeField({ default: () => new Date() })

  /**
   * @type {Date} expiresAt
   * @default 'Creation date plus maxAge'
   */
  static expiresAt = new DateTimeField({
    null: true,
    default: inst =>
      require('moment-timezone')(inst.get('createdAt'))
        .add(inst.get('maxAge'), 'minutes')
        .toDate()
  })

  static childStats = new Field({ null: true })
  static descendantStats = new Field({ null: true })

  static meta = class {
    static abstract = true
  }

  /** Check the database for a job with the same props. If there is a job
   *  alive, it will return the living job instead of spawning a new one.
   *
   * @async
   * @param {object} jobProps
   * @returns {JobBase}
   */
  static async debounce (jobProps) {
    const Model = this
    const job = new Model(jobProps)
    const existing = await this.objects
      .filter({ checksum: this.getChecksum(job.type, job.props), live: true })
      .orderBy('-createdAt')
      .first()
    return existing && existing.live ? existing : await job.save()
  }

  /** Caclculate checksum for the job props and type to allow identifying it
   * quickly in the database
   *
   * @param {string} jobType
   * @param {object} jobProps
   * @returns {string} Calculated sha1 checksum
   */
  static getChecksum (jobType, jobProps) {
    return require('crypto')
      .createHash('sha1')
      .update(`${jobType}-${JSON.stringify(jobProps)}`)
      .digest('hex')
  }

  constructor (...args) {
    super(...args)
    this.childrenIds = []
  }

  /** Format job stats numbers into convenient format.
   *
   * @param {JobStatsRow[]}
   * @returns {JobStats}
   */
  static formatStats (numbers) {
    return numbers.reduce(
      (aggr, row) => ({ ...aggr, [row.status]: sum(row.sums) }),
      {}
    )
  }

  /** Fetch job stats with a filter
   * @async
   * @param {object} filter
   * @return {JobStatsRow[]}
   */
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

  /** Fetch child and descendant stats for this job. The data are stored in
   *  {childStats} and {descendantStats}.
   * @async
   * @returns {JobBase} The same job instance
   */
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

  /** Override of DatabaseModel's create method. Spawns the job into the
   *  communication topic given.
   *
   * @async
   * @param {bool} preventSpawn Will not spawn the job if true
   * @default false
   * @returns {JobBase} The same job instance
   */
  async create (preventSpawn = false) {
    const shouldSpawn = !this.id
    await super.create()
    if (
      shouldSpawn &&
      this.get('status') === JobStatus.trigger &&
      !preventSpawn
    ) {
      await this.spawn()
    }
    return this
  }

  /** Override of DatabaseModel's update method. Sets value of
   *  {@link JobBase#updatedAt} to current date time before saving the instance
   *  fields.
   *
   * @async
   * @returns {JobBase} The same job instance
   */
  async update () {
    this.updatedAt = new Date()
    return await super.update()
  }

  /** Override of DatabaseModel's save method. Calculates value of
   * {@link JobBase#live} property.
   * @async
   * @returns {JobBase} The same instance
   */
  async save () {
    this.live = JobRunning.filter.includes(this.get('status'))
    if (getSettings('cloudJobs.store', true)) {
      return await super.save()
    }
    return this
  }

  /** Spawn execution of this job. This will run the cloud job in the
   *  infrastructure by pushing a message about the job into the job's topic
   *  unless `cloudJobs.local` is `true`. Then it will attempt to run the job
   *  locally as worker pool. Can only spawn jobs with IDs.
   *
   * @returns {JobBase} The same job instance
   */
  async spawn () {
    if (!this.pk && getSettings('cloudJobs.store', true)) {
      throw new SpawnError('Cannot spawn job without ID.')
    }
    const message = serialize(this)
    if (getSettings().cloudJobs.local) {
      const { runLocalJob } = require('./localRunner')
      await runLocalJob(this.get('topic'), message)
    } else {
      await publishMessage(this.get('topic'), message)
    }
    return this
  }

  /** Spawn child of the job. This child will be treated as a part of the job's
   *  workload. The parent job will be considered alive until all the children
   *  are successful or at least one fails. This applies to childrens
   *  descendants as well.
   *
   * @async
   * @param {object} jobProps Job model properties, the same you pass to the
   *  constructor model.
   * @returns {JobBase} The child job instance
   * @example
   *  job.spawnChild({
   *    type: 'user:fetch:profile',
   *    props: {
   *      uri: 'http://example.com/user/1
   *    }
   *  })
   */
  async spawnChild (jobProps) {
    const Model = this.constructor
    const childJob = new Model({
      ...jobProps,
      status: JobStatus.trigger,
      props: {
        ...this.props,
        ...jobProps.props
      },
      topic: jobProps.topic || this.get('topic'),
      rootId: this.rootId || this.parentId || this.id,
      parentId: this.id
    })
    const store = getSettings('cloudJobs.store', true)
    if (this.status !== JobStatus.waiting) {
      this.status = JobStatus.waiting
      if (store) {
        await this.save()
      }
    }
    if (store) {
      await childJob.save(true)
      this.childrenIds.push(childJob.id)
    }
    await childJob.spawn()
    return childJob
  }

  /** Terminate the job execution
   * @async
   * @returns {JobBase} The same instance
   */
  async stop () {
    this.status = JobStatus.stopped
    // @TODO: Stop descendants
    // @TODO: Stop ancestors?
    // @TODO: Terminate execution
    return await this.save()
  }

  /** Retry the job execution. This method is used on failure. It checks if
   *  number of attempts is withing tolerance and re-spawns the job execution.
   *
   * @async
   * @throws {RetryError} In case the job reaches retry limit
   * @returns {JobBase} The same instance
   */
  async retry (e) {
    const retried = this.get('retried')
    if (retried < this.get('maxRetries')) {
      this.set('retried', retried + 1)
      this.status = JobStatus.trigger
      await this.update()
      return await this.spawn()
    }
    const err = new RetryError(
      `${this.ident} has reached it's retry limit because it failed on: ${e.message}`,
      [e]
    )
    err.stack = e.stack
    throw err
  }

  get ident () {
    return `${getModelName(this.constructor)}#${this.pk || this.type}`
  }

  get logger () {
    if (!this.constructor.loggerInstance) {
      this.constructor.loggerInstance = logger.child(
        {},
        {
          msgPrefix: `[${this.ident}] `
        }
      )
    }
    return this.constructor.loggerInstance
  }
}

/** Convenience class for people in hurry. Implements JobBase.
 * @augments {JobBase}
 */
class Job extends JobBase {}

Job.register()
JobBase.register()

const getJobModel = getSettings('cloudJobs.model', 'Job')

module.exports = {
  getJobModel,
  Job,
  JobBase,
  JobRunning,
  JobStatus,
  JobStatusHandler
}
