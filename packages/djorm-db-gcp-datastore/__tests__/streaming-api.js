const path = require('path')

const { setupDb } = require('__jest__/datastore')
const { setupSuite } = require('__samples__/streaming-api')

describe('datastore select with streaming-api', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'streaming-api.js'))

  setupSuite({ testForeignKeys: false })
})
