const { JobStatus, JobStatusHandler } = require('./models')
const { RuntimeError, formatError } = require('./errors')
const { info } = require('djorm/logger')

const resolveHandler = (handlers, job, stage) => {
  const handlerName = JobStatusHandler[stage]
  if (handlerName in handlers) {
    const handler = handlers[handlerName]
    if (handler) {
      return handler
    }
    throw new RuntimeError(`Could not find "${handlerName} for "${job.type}"`)
  }
}

const closeupParent = async (job, stage) => {
  if (job.parentId) {
    const parent = await job.rel('parent').get()
    if (parent.live) {
      await parent.fetchStats()
      const stats = parent.childStats
      if (stats.trigger === 0 && stats.request === 0 && stats.stopped === 0) {
        info(`Calling ${parent.id} a ${stage}`)
        parent.status = stage
        await parent.save()
        await parent.spawn()
      }
    }
  }
}

/** Run a job stage
 * @async
 * @param task {Object}
 * @param task.onTrigger {Function}
 * @param task.onRequest {Function}
 * @param task.onSuccess {Function}
 * @param task.onFailure {Function}
 * @param {Job} job
 * @param stage {string}
 * @returns {Object}
 */
async function runStage (handlers, job, stage, ...args) {
  info(`Running Job#${job.id}:${stage}`)
  const handler = resolveHandler(handlers, job, stage)
  job.status = stage
  await job.save()
  if (handler) {
    await handler(job, ...args)
  }
  if (stage === JobStatus.success || stage === JobStatus.failure) {
    await closeupParent(job, stage)
  }
}

/** Run task through usual async process stages
 * @async
 * @param task {Object} Developer defined task handlers
 * @param job {Job}
 * @param topic {string} PubSub topic
 * @returns void
 */
async function runTask (handlers, job) {
  if (
    job.status &&
    job.status !== JobStatus.trigger &&
    job.status !== JobStatus.request
  ) {
    await runStage(handlers, job, job.status)
  } else {
    try {
      await runStage(handlers, job, JobStatus.request)
      if (job.childrenIds.length === 0) {
        // Do not trigger onSuccess given there were children launched
        await runStage(handlers, job, JobStatus.success)
      }
    } catch (e) {
      info(`Caught error: ${formatError(e)}`)
      if (process.env.NODE_ENV === 'test') {
        throw e
      }
      await runStage(handlers, job, JobStatus.failure, e)
      // This job will be recycled instead of fulfilling (rerun request stage)
      await job.retry(e)
    }
  }
}

module.exports = {
  runStage,
  runTask
}
