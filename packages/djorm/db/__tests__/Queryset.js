const { QuerySet, QueryJoin } = require('..')

describe('QuerySet', () => {
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
    it(`${method} returns new instance of QuerySet`, () => {
      const qs = new QuerySet()
      const result = qs[method](...args)
      expect(result).toBeInstanceOf(QuerySet)
      expect(result).not.toBe(qs)
    })
  })
})
