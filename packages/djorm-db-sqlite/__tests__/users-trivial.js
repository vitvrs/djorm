const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/users-trivial')

describe('sqlite with users-trivial', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'users-trivial.sqlite'))

  setupSuite()
})
