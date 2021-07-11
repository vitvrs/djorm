const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/streaming-api')

describe('mysql select with streaming-api', () => {
  setupDb('streaming-api.sql')

  setupSuite()
})
