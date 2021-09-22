const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/nested-objects')

describe('datastore select with nested-objects', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'nested-objects.js'))

  setupSuite({ testForeignKeys: false })
})
