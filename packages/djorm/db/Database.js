const { DatabaseMapper } = require('./DatabaseMapper')
const { NotImplemented } = require('../errors')
const { PropModel } = require('./props')

class Database extends PropModel {
  connected = false
  Mapper = DatabaseMapper

  static resolveDriver (dbConfig) {
    const Model = require(dbConfig.driver)
    return new Model(dbConfig)
  }

  async connect () {
    throw new NotImplemented()
  }

  async disconnect () {
    throw new NotImplemented()
  }

  async query (str) {
    return await this.queryDb(str)
  }

  async exec (str) {
    return await this.execDb(str)
  }

  async execDb () {
    throw new NotImplemented()
  }

  async queryDb () {
    throw new NotImplemented()
  }

  stream (query) {
    throw new NotImplemented()
  }
}

module.exports = { Database }
