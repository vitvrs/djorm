/* istanbul ignore file */
const { JobBase, createSubscription } = require('../..')
const { configure } = require('djorm/config')

const tmpFile = { name: '/tmp/djorm-cloud-jobs-example-app.sqlite' }

class CloudJob extends JobBase {}

CloudJob.register()

configure({
  apps: ['djorm-cloud-jobs/config'],
  databases: {
    default: {
      driver: 'djorm-db-sqlite',
      path: tmpFile.name
    }
  },
  cloudJobs: {
    clientConfig: {},
    local: true,
    model: 'CloudJob',
    pool: false,
    routing: {
      'test-topic': {
        grandparentJobType: 'grandparent-job-type',
        parentJobType: 'parent-job-type',
        jobType: 'job-type'
      }
    }
  }
})

const filename = __filename
const topic = 'test-topic'
const grandparentJobType = 'grandparent-job-type'
const parentJobType = 'parent-job-type'
const jobType = 'job-type'

const grandparentJobHandlers = {
  onRequest: async job => {
    await job.spawnChild({
      type: parentJobType,
      props: { passed: ['grandparent'] }
    })
  }
}

const parentJobHandlers = {
  onRequest: async job => {
    await job.spawnChild({
      type: jobType,
      props: { passed: [...job.props.passed, 'parent'] }
    })
  }
}

const jobHandlers = {
  onRequest: () => {}
}

module.exports = createSubscription({
  filename,
  topic,
  tasks: {
    [grandparentJobType]: grandparentJobHandlers,
    [parentJobType]: parentJobHandlers,
    [jobType]: jobHandlers
  }
})

module.exports.jobHandlers = jobHandlers
