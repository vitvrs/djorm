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
    const tmpFile = { name: '/tmp/djorm-cloud-jobs-result-passing.sqlite' }

    await promises.copyFile(dbPath, tmpFile.name)
    const app = require('../__samples__/resultPassing')
    const job = new Job({
      type: 'parent-job-type'
    })
    await app.runJob(formatMessageObject(job))
    await init()
    const state = await Job.objects.all()
    expect(state).toEqual([
      expect.objectContaining({
        id: 1,
        type: 'parent-job-type',
        status: 'success'
      }),
      expect.objectContaining({
        type: 'job-type',
        status: 'success',
        props: {
          index: 0,
          output: 'foo'
        }
      }),
      expect.objectContaining({
        type: 'job-type',
        status: 'success',
        props: {
          index: 1,
          output: 'bar'
        }
      }),
      expect.objectContaining({
        type: 'job-type',
        status: 'success',
        props: {
          index: 2,
          output: 'baz'
        }
      })
    ])
  })
})
