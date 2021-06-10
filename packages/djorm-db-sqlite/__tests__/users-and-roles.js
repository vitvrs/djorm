const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/users-and-roles')

describe('sqlite select with users-trivial', () => {
  setupDb(
    path.resolve(__dirname, '..', '__samples__', 'users-and-roles.sqlite')
  )

  setupSuite()
})
