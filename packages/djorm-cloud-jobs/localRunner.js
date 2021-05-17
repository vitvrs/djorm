const { error, info } = require('djorm/logger')
const { formatMessage } = require('./pubsub')
const { getEntrypoint } = require('./entry')
const { pool } = require('workerpool')

/** Run the job as a cascade of workers in a pool.
 *
 * @async
 * @param {string} topic Job topic
 * @param {Object} message Serialized job instance
 * @return void
 */
const runLocalJob = async (topic, message) => {
  info(`SPAWN: ${topic}: ${JSON.stringify(message)}`)
  const entry = getEntrypoint(topic)
  const path = require('path')
  const poolPath = path.join(__dirname, 'localJob.js')
  const jobPool = pool(poolPath)
  await jobPool
    .exec('runJob', [entry, { data: formatMessage(message) }])
    .catch(e => {
      error(e)
      error(e.stdout)
      error(e.stderr)
    })
  jobPool.terminate()
}

module.exports = {
  runLocalJob
}
