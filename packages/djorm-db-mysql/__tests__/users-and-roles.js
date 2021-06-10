const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/users-and-roles')

describe('mysql select with users-trivial', () => {
  setupDb('users-and-roles.sql')

  setupSuite()
})
