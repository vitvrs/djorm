const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/users-and-roles-alt-table-names')

describe('datastore select with users-and-roles-alt-table-names', () => {
  setupDb(
    path.resolve(
      __dirname,
      '..',
      '__samples__',
      'users-and-roles-alt-table-names.js'
    )
  )

  setupSuite({ testForeignKeys: false })
})
