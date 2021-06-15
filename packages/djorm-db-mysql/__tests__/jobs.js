const { setupDb } = require('../__samples__/setup')
const { setupSuite } = require('__samples__/jobs')

describe('mysql with jobs app', () => {
  setupDb('jobs.sql')

  setupSuite()
})
