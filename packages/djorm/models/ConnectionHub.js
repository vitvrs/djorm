const { ConnectionError } = require('../errors')
const { Hub } = require('./Hub.js')

class ConnectionHub extends Hub {
  ErrorClass = ConnectionError
  destroyInstance = instance => instance.disconnect()
}

module.exports = { ConnectionHub }
