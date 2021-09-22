const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/arrays')

describe('datastore select with arrays', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'arrays.js'))

  setupSuite({ testForeignKeys: false })
})
