const { createSubscription } = require('..')
const { RuntimeError } = require('../errors')
const { configure } = require('djorm/config')

describe('createSubscription', () => {
  beforeEach(() => {
    configure({
      apps: ['djorm-cloud-jobs/pubsub'],
      cloudJobs: {
        clientConfig: {},
        local: true,
        routing: {}
      }
    })
  })

  it('returns object with entrypoint function', () => {
    const tasks = {}
    const topic = 'test-topic'
    expect(createSubscription({ tasks, topic })).toEqual({
      runJob: expect.any(Function)
    })
  })

  it('does not throw error given message is falsy', async () => {
    const subscription = createSubscription({ tasks: {}, topic: 'test-topic' })
    const message = null
    await expect(subscription.runJob(message)).resolves.toEqual()
  })

  it('does not throw given message has no data', async () => {
    const subscription = createSubscription({ tasks: {}, topic: 'test-topic' })
    const message = ''
    await expect(subscription.runJob(message)).resolves.toEqual()
  })

  it('throws RuntimeError given message has no type', async () => {
    const subscription = createSubscription({ tasks: {}, topic: 'test-topic' })
    const message = {
      data: Buffer.from(
        JSON.stringify({
          id: 666
        })
      )
    }
    await expect(subscription.runJob(message)).rejects.toBeInstanceOf(
      RuntimeError
    )
  })

  it('throws RuntimeError given message has unknown type', async () => {
    const subscription = createSubscription({
      tasks: [
        {
          name: 'never-ran',
          onRequest: () => {}
        }
      ],
      topic: 'test-topic'
    })
    const message = {
      data: Buffer.from(
        JSON.stringify({
          type: 'unkown-type',
          id: 666
        })
      )
    }
    await expect(subscription.runJob(message)).rejects.toBeInstanceOf(
      RuntimeError
    )
  })
})
