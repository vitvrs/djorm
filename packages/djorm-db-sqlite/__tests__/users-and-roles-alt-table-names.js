const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/users-and-roles-alt-table-names')

describe('sqlite select with users-and-roles-alt-table-names', () => {
  setupDb(
    path.resolve(
      __dirname,
      '..',
      '__samples__',
      'users-and-roles-alt-table-names.sqlite'
    )
  )

  setupSuite()
})
