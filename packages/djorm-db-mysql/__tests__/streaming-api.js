const path = require('path')

const { setupDb } = require('__jest__/mysql')
const { setupSuite } = require('__samples__/streaming-api')

describe('mysql select with streaming-api', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'streaming-api.sql'))

  setupSuite()
})
