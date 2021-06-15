const moment = require('moment-timezone')
const { configure } = require('djorm/config')

moment.tz.setDefault('UTC')
moment.suppressDeprecationWarnings = true
configure({
  secretKey: 'djorm-secret-key-test-123',
  logger: {
    level: 'error'
  }
})
