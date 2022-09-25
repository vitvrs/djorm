const { Hub } = require('../models/Hub')
const { StorageError } = require('../errors')
const { Storage } = require('./Storage')

class StorageHub extends Hub {
  ErrorClass = StorageError
  ItemClass = Storage
}

module.exports = new StorageHub()
