const { error, info } = require('djorm/logger')
const { Job } = require('./models')
const { parseMessage } = require('./pubsub')
const { registerEntrypoint } = require('./entry')
const { runTask } = require('./runTask')
const { RuntimeError } = require('./errors')
const { init, shutdown } = require('djorm/config')

/**
 * Creates job process wrapper which initializes djorm, takes care of it's
 * shutdown and handles error logging
 *
 * @param {AsyncFunction} fn The function to wrap
 * @returns {AsyncFunction}
 */
function createProcessWrapper (fn) {
  return async function (job) {
    try {
      await init()
      await fn(job)
    } catch (processError) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV === 'test') {
        throw processError
      } else {
        error(processError)
        if (processError.errors) {
          for (const e of processError.errors) {
            error(e)
          }
        }
        process.exit(255)
      }
    } finally {
      await shutdown()
    }
  }
}

/**
 * Resolves job handlers based on subscription specification and job type
 *
 * @param {Object|Function} work
 * @param {string} jobType
 * @returns {Object} Object with handler names as keys and handler functions
 *  as values
 */
const resolveJobHandlers = (work, jobType) => {
  if (typeof work === 'function') {
    return {
      onRequest: work
    }
  }
  const ref = work[jobType]
  if (ref) {
    if (typeof ref === 'function') {
      return { onRequest: ref }
    }
    return work[jobType]
  }
  throw new RuntimeError(`No handler for "${jobType}"`)
}

/** Workload description. It
 *  can either be a function or status handlers.
 *
 * @typedef {Object} WorkloadSpecs
 * @example
 *  // Handle any job type
 *  async job => { \/**\/ }
 * @example
 *  // Handle specific job types
 *  {
 *    'user:fetch:list:overview': async job => { \/**\/ },
 *    'user:fetch:list:page': async job => { \/**\/ },
 *    'user:fetch:profile': async job => { \/**\/ },
 *  }
 * @example
 *  // Handle any job type and provide status handlers
 *  {
 *    onRequest: async job => { \/**\/ },
 *    onSuccess: async job => { \/**\/ },
 *    onFailure: async job => { \/**\/ },
 *  }
 * @example
 *  // Handle specific job types and provide status handlers
 *  {
 *    'user:fetch:list:overview': {
 *      onRequest: async job => { \/**\/ },
 *      onSuccess: async job => { \/**\/ },
 *    },
 *    'user:fetch:list:page': async job => { \/**\/ },
 *    'user:fetch:profile': async job => { \/**\/ },
 *  }
 **/

/**
 * @typedef {object} SubscriptionSpecs
 * @prop {string} filename The entrypoint filename.
 *  Required to run the job locally.
 * @prop {Class} model Job model used to pass job instances. By default it is
 *  {@link Job}.
 * @prop {WorkloadSpecs} tasks Logic defining the workload done under this
 *  subscription
 * @prop {string} topic Subscription topic, required to
 *  run jobs locally.
 */

/**
 * Creates subscription that can be exported as the cloud function entry
 * module. Use "runJob" as the entrypoint.
 *
 * @param {SubscriptionSpecs} subscriptionSpecs Subscription specification
 * @returns {Object} Use this as module.exports. It contains "runJob", the entrypoint.
 */
const createSubscription = ({ filename, model, tasks, topic }) => {
  /** Listen to PubSub messages for car configurations to render */
  async function subscribeToMessages (message, context) {
    const Model = model || Job
    const job = Model.from(parseMessage(message))
    if (job) {
      if (!job.id) {
        await job.create(true)
      }
      const handlers = resolveJobHandlers(tasks, job.type)
      await runTask(handlers, job, topic)
    } else {
      info(`No job resolved for message ${message}`)
    }
  }

  registerEntrypoint(topic, filename)
  return { runJob: createProcessWrapper(subscribeToMessages) }
}

module.exports = {
  createSubscription
}
