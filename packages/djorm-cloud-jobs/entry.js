let entryMap = {}

const registerEntrypoint = (topic, descriptor) => {
  entryMap[topic] = descriptor
}

const getEntrypoint = topic => entryMap[topic]
const getEntryMap = () => entryMap
const shutdown = () => {
  entryMap = {}
}

module.exports = { getEntryMap, getEntrypoint, registerEntrypoint, shutdown }
