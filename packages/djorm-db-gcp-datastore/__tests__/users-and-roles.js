const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/users-and-roles')

describe('datastore select with users-and-roles', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'users-and-roles.js'))

  setupSuite({ testForeignKeys: false })
})
