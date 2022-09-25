const { Database } = require('./Database')
const { DatabaseError } = require('./errors')
const { ConnectionHub } = require('../models/ConnectionHub')

class DatabaseHub extends ConnectionHub {
  ErrorClass = DatabaseError
  ItemClass = Database
}

module.exports = new DatabaseHub()
