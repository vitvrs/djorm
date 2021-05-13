const path = require('path')
const tmp = require('tmp-promise')

const { configure } = require('djorm/config')
const { createSubscription } = require('..')
const { formatMessage } = require('../pubsub')
const { promises } = require('fs')
const { RetryError, RuntimeError } = require('../errors')
const { Job } = require('../models')

const formatMessageObject = message => ({
  data: formatMessage(message)
})

describe('createSubscription', () => {
  let tmpFile
  const setupDb = async dbFile => {
    const dbPath = path.resolve(__dirname, '..', '__samples__', dbFile)
    tmpFile = await tmp.file()
    await promises.copyFile(dbPath, tmpFile.path)
  }

  beforeEach(async () => {
    await setupDb('jobs.sqlite')
    configure({
      apps: ['djorm-cloud-jobs/pubsub'],
      databases: {
        default: {
          driver: 'djorm-db-sqlite',
          path: tmpFile.path
        }
      },
      cloudJobs: {
        clientConfig: {},
        local: true,
        routing: {
          'test-topic': {
            runTestTask: 'mock-task-type'
          }
        }
      }
    })
  })

  afterEach(async () => {
    await tmpFile.cleanup()
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
      tasks: {
        'never-ran': () => {}
      },
      topic: 'test-topic'
    })
    const message = formatMessageObject({
      type: 'unkown-type',
      id: 666
    })
    await expect(subscription.runJob(message)).rejects.toBeInstanceOf(
      RuntimeError
    )
  })

  it('does not publish two times failed retried task given there is no explicit limit', async () => {
    const error = new Error('Test!')
    const subscription = createSubscription({
      tasks: {
        'mock-task-type': jest.fn().mockRejectedValue(error)
      },
      topic: 'test-topic'
    })
    const job = {
      id: 666,
      type: 'mock-task-type',
      retried: 3,
      props: {
        clientId: 32,
        carModelCode: '3V'
      }
    }
    await expect(subscription.runJob(formatMessageObject(job))).rejects.toEqual(
      expect.any(RetryError)
    )
  })

  it('passes job to onRequest handler', async () => {
    let jobValues
    const jobRunner = jest.fn().mockImplementation(job => {
      jobValues = { ...job }
    })
    const subscription = createSubscription({
      tasks: {
        'mock-task-type': jobRunner
      },
      topic: 'test-topic'
    })
    const job = {
      type: 'mock-task-type',
      id: 666,
      props: {}
    }

    await subscription.runJob(formatMessageObject(job))
    expect(jobValues).toMatchObject({
      type: 'mock-task-type',
      id: 666,
      props: {},
      checksum: 'fe03d6c9dd071c5475ff886d89e082b1a3b13c93',
      status: 'request'
    })
  })

  it('given task has stage specified and it is not trigger and not request, it runs just the stage', async () => {
    const jobHandlers = {
      onFailure: jest.fn(),
      onRequest: jest.fn(),
      onSuccess: jest.fn(),
      onTrigger: jest.fn()
    }
    const subscription = createSubscription({
      tasks: {
        'mock-task-type': jobHandlers
      },
      topic: 'test-topic'
    })
    const job = {
      id: 666,
      type: 'mock-task-type',
      status: 'success',
      props: {
        clientId: 32,
        carModelCode: '3V'
      }
    }
    await subscription.runJob(formatMessageObject(job))
    expect(jobHandlers.onFailure).not.toHaveBeenCalled()
    expect(jobHandlers.onTrigger).not.toHaveBeenCalled()
    expect(jobHandlers.onRequest).not.toHaveBeenCalled()
    expect(jobHandlers.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 666,
        type: 'mock-task-type',
        props: expect.objectContaining({
          carModelCode: '3V',
          clientId: 32
        })
      })
    )
  })

  it('given task has undefined handler, it throws RuntimeError error', async () => {
    const subscription = createSubscription({
      tasks: {
        'mock-task-type': {
          onRequest: null
        }
      },
      topic: 'test-topic'
    })
    const job = {
      id: 666,
      props: {
        clientId: 10
      }
    }
    await expect(subscription.runJob(formatMessageObject(job))).rejects.toEqual(
      expect.any(RuntimeError)
    )
  })

  it('stores job without ID', async () => {
    const jobRunner = jest.fn()
    const subscription = createSubscription({
      tasks: {
        'mock-task-type': jobRunner
      },
      topic: 'test-topic'
    })
    const job = new Job({
      type: 'mock-task-type',
      props: {}
    })

    await subscription.runJob(formatMessageObject(job))
    expect(jobRunner).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
  })
})
