const { Database } = require('../Database')

describe('Database', () => {
  class DbMock extends Database {
    connectDb = jest.fn()
    queryDb = jest.fn()
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
    db.queryDb.mockResolvedValue()
    const promise = db.query('SELECT FUN FROM TESTS')
    expect(db.connectDb).toHaveBeenCalled()
    jest.advanceTimersByTime(501)
    await expect(promise).resolves.toEqual()
  })

  it('query waits for connection attempt when its already on the way', async () => {
    const db = new DbMock()
    db.connectDb.mockImplementation(
      async () => await new Promise(resolve => setTimeout(resolve, 500))
    )
    db.queryDb.mockResolvedValue()
    const connectPromise = db.connect()
    const queryPromise = db.query('SELECT FUN FROM TESTS')
    expect(db.connectDb).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(501)
    await expect(connectPromise).resolves.toEqual()
    await expect(queryPromise).resolves.toEqual()
  })
})
