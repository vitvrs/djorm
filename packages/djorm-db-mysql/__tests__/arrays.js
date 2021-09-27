const path = require('path')

const { setupDb } = require('__jest__/mysql')
const { setupSuite } = require('__samples__/arrays')

describe('mysql select with arrays', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'arrays.sql'))

  setupSuite()
})
