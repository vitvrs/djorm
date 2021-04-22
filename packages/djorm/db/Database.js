const { DatabaseMapper } = require('./DatabaseMapper')
const { NotImplemented } = require('../errors')
const { PropModel } = require('./props')

class Database extends PropModel {
  connected = false
  connectionPromise = null
  Mapper = DatabaseMapper

  static resolveDriver (dbConfig) {
    const Model = require(dbConfig.driver)
    return new Model(dbConfig)
  }

  async connectDb () {
    throw new NotImplemented()
  }

  async connect () {
    this.connectionPromise = this.connectDb()
    await this.connectionPromise
    this.connectionPromise = null
  }

  async disconnect () {
    throw new NotImplemented()
  }

  async waitForConnection () {
    if (!this.connected) {
      if (this.connectionPromise) {
        await this.connectionPromise
      } else {
        await this.connect()
      }
    }
  }

  async query (str) {
    await this.waitForConnection()
    return await this.queryDb(str)
  }

  async exec (str) {
    await this.waitForConnection()
    return await this.execDb(str)
  }

  async execDb () {
    throw new NotImplemented()
  }

  async queryDb () {
    throw new NotImplemented()
  }

  stream (qs) {
    throw new NotImplemented()
  }
}

module.exports = { Database }
