/* istanbul ignore file */
const { createSubscription } = require('../..')
const { configure } = require('djorm/config')
const { JobStatus } = require('../../models')

configure({
  apps: ['djorm-cloud-jobs/config'],
  databases: {
    default: {
      driver: 'djorm-db-sqlite',
      path: '/tmp/djorm-cloud-jobs-process-delegation.sqlite'
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
    await job.spawnChild({
      type: jobType
    })
  }
}

const jobHandlers = {
  onRequest: job => {
    // Imagine that here we call some kind of external service
    // And then return status waiting
    return [null, JobStatus.waiting]
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
