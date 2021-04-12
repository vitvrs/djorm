const { Query, QueryJoin } = require('..')

describe('Query', () => {
  const newInstanceMethods = [
    ['from', 'foo'],
    ['distinct', 'foo'],
    ['filter', { foo: 'bar' }],
    ['exclude', { foo: 'bar' }],
    ['orderBy', ['foo']],
    ['join', new QueryJoin({ table: 'users', conditions: { id: 1 } })],
    ['limit', [10]],
    ['offset', [10]]
  ]

  newInstanceMethods.forEach(([method, ...args]) => {
    it(`${method} returns new instance of Query`, () => {
      const qs = new Query()
      const result = qs[method](...args)
      expect(result).toBeInstanceOf(Query)
      expect(result).not.toBe(qs)
    })
  })
})
