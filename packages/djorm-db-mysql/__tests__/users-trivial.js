const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/users-trivial')

describe('mysql select with users-trivial', () => {
  setupDb('users-trivial.sql')

  setupSuite()
})
