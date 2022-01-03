const { Database } = require('../Database')

describe('Database', () => {
  class DbMock extends Database {
    connectDb = jest.fn()
    disconnectDb = jest.fn()
    queryDb = jest.fn().mockImplementation(async function (query) {
      return await this.runDatabaseOperation(() => {})
    })

    execDb = jest.fn()
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('query waits for connection', async () => {
    const db = new DbMock()
    db.connectDb.mockImplementation(
      async () => await new Promise(resolve => setTimeout(resolve, 500))
    )
    const promise = db.query('SELECT FUN FROM TESTS')
    expect(db.connectDb).toHaveBeenCalled()
    jest.advanceTimersByTime(505)
    await expect(promise).resolves.toEqual()
  })

  it('query waits for connection attempt when its already on the way', async () => {
    const db = new DbMock()
    db.connectDb.mockImplementation(
      async () => await new Promise(resolve => setTimeout(resolve, 500))
    )
    const connectPromise = db.connect()
    db.query('SELECT FUN FROM TESTS')
    expect(db.connectDb).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(505)
    await expect(connectPromise).resolves.toEqual()
  })

  it('query waits for connection and executes query given db is already connecting', async () => {
    const db = new DbMock()
    db.connectDb.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    })
    const connectPromise = db.connect()
    const queryPromise = db.query('SELECT FUN FROM TESTS')
    expect(db.connectDb).toHaveBeenCalledTimes(1)
    jest.runAllTimers()
    await connectPromise
    jest.runAllTimers()
    await queryPromise
  })
})
