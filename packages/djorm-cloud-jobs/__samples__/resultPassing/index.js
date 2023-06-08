/* istanbul ignore file */
const { createSubscription } = require('../..')
const { configure } = require('djorm/config')

configure({
  apps: ['djorm-cloud-jobs/config'],
  databases: {
    default: {
      driver: 'djorm-db-sqlite',
      path: '/tmp/djorm-cloud-jobs-result-passing.sqlite'
    }
  },
  cloudJobs: {
    clientConfig: {},
    local: true,
    keepAlive: true,
    routing: {
      'test-topic': {
        parentJobType: 'parent-job-type',
        jobType: 'job-type'
      }
    }
  }
})

const filename = __filename
const topic = 'test-topic'
const parentJobType = 'parent-job-type'
const jobType = 'job-type'

const parentJobHandlers = {
  onRequest: async job => {
    await Promise.all(
      [0, 1, 2].map(
        async index =>
          await job.spawnChild({
            type: jobType,
            props: {
              index
            }
          })
      )
    )
  }
}

const jobHandlers = {
  onRequest: async job => {
    await new Promise(resolve =>
      setTimeout(resolve, 66 / (job.props.index + 1))
    )
    switch (job.props.index) {
      case 2:
        return 'baz'
      case 1:
        return 'bar'
      default:
        return 'foo'
    }
  }
}

module.exports = createSubscription({
  filename,
  topic,
  tasks: {
    [parentJobType]: parentJobHandlers,
    [jobType]: jobHandlers
  }
})

module.exports.jobHandlers = jobHandlers
