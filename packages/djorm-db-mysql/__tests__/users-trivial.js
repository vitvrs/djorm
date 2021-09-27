const path = require('path')

const { setupDb } = require('__jest__/mysql')
const { setupSuite } = require('__samples__/users-trivial')

describe('mysql select with users-trivial', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'users-trivial.sql'))

  setupSuite()
})
