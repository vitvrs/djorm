const entryMap = {}

const registerEntrypoint = (topic, descriptor) => {
  entryMap[topic] = descriptor
}

const getEntrypoint = topic => entryMap[topic]
const getEntryMap = () => entryMap

module.exports = { getEntryMap, getEntrypoint, registerEntrypoint }
