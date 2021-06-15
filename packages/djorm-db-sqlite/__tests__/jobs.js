const path = require('path')

const { setupDb } = require('__jest__/sqlite')
const { setupSuite } = require('__samples__/jobs')

describe('sqlite with jobs app', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'jobs.sqlite'))

  setupSuite()
})
