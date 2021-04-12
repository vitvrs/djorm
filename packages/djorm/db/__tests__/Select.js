const { Select, QueryJoin } = require('..')

describe('Select', () => {
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
    it(`${method} returns new instance of Select`, () => {
      const qs = new Select()
      const result = qs[method](...args)
      expect(result).toBeInstanceOf(Select)
      expect(result).not.toBe(qs)
    })
  })
})
