const { DatabaseMapper } = require('./DatabaseMapper')
const { NotImplemented } = require('../errors')
const { PropModel } = require('./props')

class Database extends PropModel {
  connected = false
  connecting = false
  Mapper = DatabaseMapper

  constructor (...args) {
    super(...args)
    this.queue = []
  }

  static resolveDriver (dbConfig) {
    const Model = require(dbConfig.driver)
    return new Model(dbConfig)
  }

  async connectDb () {
    throw new NotImplemented()
  }

  async connect () {
    this.connecting = true
    await this.connectDb()
    this.connecting = false
    this.resolveQueue()
  }

  async resolveQueue () {
    await new Promise(resolve => setTimeout(resolve, 0))
    let callback
    while ((callback = this.queue.shift())) {
      callback()
    }
  }

  async disconnect () {
    throw new NotImplemented()
  }

  async waitForConnection () {
    if (!this.connected) {
      if (this.connecting) {
        await new Promise(resolve => {
          this.queue.push(resolve)
        })
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

  async stream (qs) {
    await this.waitForConnection()
    return this.streamDb(qs)
  }

  streamDb (qs) {
    throw new NotImplemented()
  }
}

module.exports = { Database }
