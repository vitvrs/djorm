const { error, info } = require('djorm/config')
const { formatMessage } = require('./pubsub')
const { getEntrypoint } = require('./entry')
const { pool } = require('workerpool')

module.exports = {
  runLocalJob: async (topic, message) => {
    info(`SPAWN: ${topic}: ${JSON.stringify(message)}`)
    const entry = getEntrypoint(topic)
    const path = require('path')
    const poolPath = path.join(__dirname, 'localJob.js')
    const jobPool = pool(poolPath)
    await jobPool
      .exec('runTask', [entry, { data: formatMessage(message) }])
      .catch(e => {
        error(e)
        error(e.stdout)
        error(e.stderr)
        jobPool.terminate()
      })
  }
}
