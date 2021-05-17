const path = require('path')

const { formatMessage } = require('../pubsub')
const { Job } = require('../models')
const { promises } = require('fs')
const { init, shutdown } = require('djorm/config')

const formatMessageObject = message => ({
  data: formatMessage(message)
})

describe('createSubscription', () => {
  afterEach(shutdown)

  it('bubbles to the root job handler', async () => {
    const dbPath = path.resolve(__dirname, '..', '__samples__', 'jobs.sqlite')
    const tmpFile = { name: '/tmp/djorm-cloud-jobs-example-app.sqlite' }

    await promises.copyFile(dbPath, tmpFile.name)
    const app = require('../__samples__/exampleApp')
    const job = new Job({
      type: 'grandparent-job-type'
    })
    await app.runJob(formatMessageObject(job))
    await init()
    expect(await Job.objects.all()).toEqual([
      expect.objectContaining({
        id: 1,
        type: 'grandparent-job-type',
        status: 'success'
      }),
      expect.objectContaining({
        id: 2,
        type: 'parent-job-type',
        status: 'success'
      }),
      expect.objectContaining({ id: 3, type: 'job-type', status: 'success' })
    ])
  })
})
