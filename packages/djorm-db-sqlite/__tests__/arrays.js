const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/arrays')

describe('sqlite with arrays', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'arrays.sqlite'))

  setupSuite()
})
