const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/nested-objects')

describe('mysql select with nested-objects', () => {
  setupDb('nested-objects.sql')

  setupSuite()
})
