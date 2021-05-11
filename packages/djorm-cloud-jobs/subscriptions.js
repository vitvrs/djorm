const { error, info } = require('djorm/logger')
const { Job } = require('./models')
const { parseMessage } = require('./pubsub')
const { registerEntrypoint } = require('./entry')
const { runTask } = require('./runTask')
const { RuntimeError } = require('./errors')
const { init, shutdown } = require('djorm/config')

function createProcessWrapper (fn) {
  return async function (...args) {
    try {
      await init()
      await fn(...args)
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

const resolveJobHandlers = (work, message) => {
  if (work instanceof Function) {
    return {
      onRequest: work
    }
  }
  const ref = work[message.type]
  if (ref) {
    if (ref instanceof Function) {
      return { onRequest: ref }
    }
    return work[message.type]
  }
  throw new RuntimeError(`No handler for "${message.type}"`)
}

const createSubscription = ({ tasks, topic, filename, entry }) => {
  /** Listen to PubSub messages for car configurations to render */
  async function subscribeToMessages (message, context) {
    const job = Job.from(parseMessage(message))
    if (job) {
      if (!job.id) {
        await job.create()
      }
      await runTask(resolveJobHandlers(tasks, job), job, topic)
    } else {
      info(`No job resolved for message ${message}`)
    }
  }

  registerEntrypoint(topic, { filename, entry })
  return { runJob: createProcessWrapper(subscribeToMessages) }
}

module.exports = {
  createSubscription
}
