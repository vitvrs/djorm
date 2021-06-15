const { getSettings } = require('djorm/config')
const { PubSub } = require('@google-cloud/pubsub')
const { serialize } = require('djorm/filters')

let pubsub
let topicMap

function init () {
  const settings = getSettings()
  pubsub = new PubSub(settings.cloudJobs.clientConfig)
  topicMap = Object.entries(settings.cloudJobs.routing).reduce(
    (aggr, [topic, triggers]) =>
      Object.values(triggers).reduce(
        (inner, trigger) => ({ ...inner, [trigger]: topic }),
        aggr
      ),
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

async function publishMessage (topicName, message) {
  await pubsub.topic(topicName).publish(formatMessage(message))
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
