const moment = require('moment-timezone')

const { configure } = require('djorm/config')
const { advanceTo, clear } = require('jest-date-mock')
const { Job } = require('../models')
const { runTask } = require('../runTask')
const { RuntimeError } = require('../errors')

describe('runTask', () => {
  beforeEach(() => {
    advanceTo(moment('2020-10-19T12:00:00.000').toDate())
    configure({
      apps: ['djorm-cloud-jobs/pubsub'],
      cloudJobs: {
        local: true,
        routing: {
          'test-topic': {
            runTest: 'mock-task-type'
          }
        }
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    clear()
  })

  it.only('passes job to onRequest handler', async () => {
    const task = {
      onRequest: jest.fn()
    }
    const job = new Job({
      type: 'mock-task-type',
      id: 666,
      props: { clientId: 42 }
    })
    const topic = 'test-topic'
    await runTask(task, job, topic)
    expect(task.onRequest).toHaveBeenCalledWith(job)
  })

  it('does not publish failed two times retried task given there is no explicit limit', async () => {
    const error = new Error('Test!')
    const task = {
      onRequest: jest.fn().mockRejectedValue(error)
    }
    const job = new Job({
      id: 666,
      type: 'mock-task-type',
      retried: 3,
      props: {
        clientId: 32,
        carModelCode: '3V'
      }
    })
    const topic = 'test-topic'
    await expect(runTask(task, job, topic)).rejects.toEqual(error)
    expect(publish).not.toHaveBeenCalled()
  })

  it('given task has stage specified, it runs just the stage', async () => {
    const task = {
      onFailure: jest.fn(),
      onRequest: jest.fn(),
      onSuccess: jest.fn(),
      onTrigger: jest.fn()
    }
    const job = new Job({
      id: 666,
      type: 'mock-task-type',
      status: 'success',
      props: {
        clientId: 32,
        carModelCode: '3V'
      }
    })
    const topic = 'test-topic'
    await runTask(task, job, topic)
    expect(task.onFailure).not.toHaveBeenCalled()
    expect(task.onTrigger).not.toHaveBeenCalled()
    expect(task.onRequest).not.toHaveBeenCalled()
    expect(task.onSuccess).toHaveBeenCalledWith(
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
    const task = {
      onRequest: null
    }
    const job = new Job({
      id: 666,
      props: {
        clientId: 10
      }
    })
    const topic = 'test-topic'
    await expect(async () => await runTask(task, job, topic)).rejects.toThrow(
      RuntimeError
    )
  })
})
