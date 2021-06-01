const moment = require('moment-timezone')
const { configure } = require('djorm/config')

moment.tz.setDefault('UTC')
moment.suppressDeprecationWarnings = true
configure({
  logger: {
    level: 'error'
  }
})
