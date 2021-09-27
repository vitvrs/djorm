const path = require('path')

const { setupDb } = require('__jest__/mysql')
const { setupSuite } = require('__samples__/jobs')

describe('mysql with jobs app', () => {
  setupDb(path.resolve(__dirname, '..', '__samples__', 'jobs.sql'))

  setupSuite()
})
