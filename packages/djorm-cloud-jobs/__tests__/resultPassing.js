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
    app = require('../__samples__/resultPassing')
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
      id: 1,
      type: 'parent-job-type'
    })
    await app.runJob(formatMessageObject(job))
    await init()
    const state = await Job.objects.all()
    expect(state).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          type: 'parent-job-type',
          status: 'success'
        }),
        expect.objectContaining({
          type: 'job-type',
          status: 'success',
          props: {
            index: 0
          },
          output: 'foo'
        }),
        expect.objectContaining({
          type: 'job-type',
          status: 'success',
          props: {
            index: 1
          },
          output: 'bar'
        }),
        expect.objectContaining({
          type: 'job-type',
          status: 'success',
          props: {
            index: 2
          },
          output: 'baz'
        })
      ])
    )
  })
})
