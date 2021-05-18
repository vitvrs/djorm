const path = require('path')

const { error, info } = require('djorm/logger')
const { formatMessage } = require('./pubsub')
const { getEntrypoint } = require('./entry')
const { pool } = require('workerpool')
const { getSettings } = require('djorm/config')

/** Run the job as a cascade of workers in a pool.
 *
 * @async
 * @param {string} topic
 * @param {Object} message
 * @return void
 */
const runPoolJob = async (topic, message) => {
  const entry = getEntrypoint(topic)
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

/** Run the job in local environment
 *
 * @async
 * @param {string} topic Job topic
 * @param {Object} message Serialized job instance
 * @return void
 */
const runLocalJob = async (topic, message) => {
  info(`SPAWN: ${topic}: ${JSON.stringify(message)}`)
  if (getSettings('cloudJobs.pool', process.env.NODE_ENV !== 'test')) {
    return await runPoolJob(topic, message)
  }
  return await require(getEntrypoint(topic)).runJob({
    data: formatMessage(message)
  })
}

module.exports = {
  runLocalJob
}
