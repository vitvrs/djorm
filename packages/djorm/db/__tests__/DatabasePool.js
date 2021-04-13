const { DatabasePool, instance } = require('../DatabasePool')

describe('DatabasePool', () => {
  it('getPool returns pool instance', () => {
    expect(instance).toBeInstanceOf(DatabasePool)
  })
})
