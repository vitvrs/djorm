const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/users-trivial')

describe('datastore select', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'users-trivial.js'))

  setupSuite()
})
