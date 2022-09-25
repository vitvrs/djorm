const hub = require('../DatabaseHub')

const { ConnectionHub } = require('../../models/ConnectionHub')

describe('DatabaseHub', () => {
  it('getPool returns pool instance', () => {
    expect(hub).toBeInstanceOf(ConnectionHub)
  })
})
