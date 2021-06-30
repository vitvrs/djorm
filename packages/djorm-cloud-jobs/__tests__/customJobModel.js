const path = require('path')

const { formatMessage } = require('../pubsub')
const { getModel } = require('djorm/models')
const { configure, init, shutdown } = require('djorm/config')
const { setupDb } = require('__jest__/sqlite')

const formatMessageObject = message => ({
  data: formatMessage(message)
})

describe('customJobModel app', () => {
  let app

  const test = setupDb(
    path.resolve(__dirname, '..', '__samples__', 'jobs-custom-model.sqlite')
  )

  beforeEach(() => {
    app = require('../__samples__/customJobModel')
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
    const Model = getModel('CloudJob')
    const job = new Model({
      type: 'grandparent-job-type'
    })
    await app.runJob(formatMessageObject(job))
    await init()
    const state = await Model.objects.all()
    expect(state).toEqual([
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
