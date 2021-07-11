const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/nested-objects')

describe('sqlite with nested-objects', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'nested-objects.sqlite'))

  setupSuite()
})
