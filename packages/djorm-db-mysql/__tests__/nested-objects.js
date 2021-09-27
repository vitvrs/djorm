const path = require('path')

const { setupDb } = require('__jest__/mysql')
const { setupSuite } = require('__samples__/nested-objects')

describe('mysql select with nested-objects', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'nested-objects.sql'))

  setupSuite()
})
