const path = require('path')

const { formatMessage } = require('../pubsub')
const { Job } = require('../models')
const { configure, init, shutdown } = require('djorm/config')
const { setupDb } = require('__jest__/sqlite')

const formatMessageObject = message => ({
  data: formatMessage(message)
})

describe('createSubscription', () => {
  let app

  const test = setupDb(
    path.resolve(__dirname, '..', '__samples__', 'jobs.sqlite')
  )

  beforeEach(() => {
    app = require('../__samples__/processDelegation')
    configure({
      databases: {
        default: {
          driver: 'djorm-db-sqlite',
          path: test.tmpFile.path
        }
      }
    })
  })

  afterEach(shutdown)

  it('bubbles to the root job handler', async () => {
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
