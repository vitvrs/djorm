const { getSettings } = require('djorm/config')
const { PubSub } = require('@google-cloud/pubsub')
const { serialize } = require('djorm/filters')

let pubsub
let topicMap

function init () {
  const settings = getSettings()
  pubsub = new PubSub(settings.cloudJobs.clientConfig)
  topicMap = Object.entries(settings.cloudJobs.routing).reduce(
    (aggr, [topic, triggers]) => {
      const src = Array.isArray(triggers) ? triggers : Object.values(triggers)
      return src.reduce(
        (inner, trigger) => ({ ...inner, [trigger]: topic }),
        aggr
      )
    },
    {}
  )
}

function shutdown () {
  pubsub = null
  topicMap = null
}

function formatMessage (message) {
  return Buffer.from(JSON.stringify(serialize(message)))
}

function parseMessage (message) {
  return message && message.data
    ? JSON.parse(Buffer.from(message.data, 'base64').toString())
    : null
}

async function retryOnFailure ({
  fn,
  maxRetries = 2,
  attempt = 0,
  timeout = 100
}) {
  try {
    return await fn()
  } catch (e) {
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, timeout))
      return await retryOnFailure({
        fn,
        maxRetries,
        attempt: attempt + 1,
        timeout
      })
    }
    throw e
  }
}

async function publishMessage (topicName, message) {
  const topic = pubsub.topic(topicName)
  await retryOnFailure({
    fn: async () => topic.publish(formatMessage(message))
  })
}

function resolveTopic (jobType) {
  return (topicMap && topicMap[jobType]) || undefined
}

function getPubSub () {
  return pubsub
}

module.exports = {
  init,
  formatMessage,
  getPubSub,
  resolveTopic,
  parseMessage,
  publishMessage,
  shutdown
}
