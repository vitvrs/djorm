const { DatabaseHub, instance } = require('../DatabaseHub')

describe('DatabaseHub', () => {
  it('getPool returns pool instance', () => {
    expect(instance).toBeInstanceOf(DatabaseHub)
  })
})
