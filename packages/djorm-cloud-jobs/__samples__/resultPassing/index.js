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
    for (let index = 0; index < 3; index++) {
      await job.spawnChild({
        type: jobType,
        props: {
          index
        }
      })
    }
  }
}

const jobHandlers = {
  onRequest: job => {
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
