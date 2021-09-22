const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/arrays')

describe('mysql select with arrays', () => {
  setupDb('arrays.sql')

  setupSuite()
})
