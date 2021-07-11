const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/streaming-api')

describe('sqlite with streaming-api', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'streaming-api.sqlite'))

  setupSuite()
})
