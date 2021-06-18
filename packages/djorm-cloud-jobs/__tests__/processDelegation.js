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
    const tmpFile = { name: '/tmp/djorm-cloud-jobs-process-delegation.sqlite' }

    await promises.copyFile(dbPath, tmpFile.name)
    const app = require('../__samples__/processDelegation')
    const job = new Job({
      type: 'parent-job-type'
    })
    await app.runJob(formatMessageObject(job))
    await init()
    const state = await Job.objects.all()
    expect(state).toEqual([
      expect.objectContaining({
        type: 'parent-job-type',
        status: 'waiting'
      }),
      expect.objectContaining({
        type: 'job-type',
        status: 'waiting'
      })
    ])
  })
})
