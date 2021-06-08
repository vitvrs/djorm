const { DatabaseMapper } = require('./DatabaseMapper')
const { NotImplemented } = require('../errors')
const { PropModel } = require('./props')
const { debug, trace } = require('../logger')

class Database extends PropModel {
  connected = false
  connecting = false
  disconnectTimeout = null
  Mapper = DatabaseMapper

  constructor (...args) {
    super(...args)
    this.queue = []
  }

  static resolveDriver (dbConfig) {
    const Model = require(dbConfig.driver)
    return new Model(dbConfig)
  }

  getSchema () {
    return this.props.schema
  }

  planDisconnect () {
    this.cancelDisconnectPlan()
    const maxAge = this.getProp('connectionMaxAge', 0)
    if (maxAge !== null) {
      this.disconnectTimeout = setTimeout(() => this.disconnect(), maxAge)
    }
  }

  cancelDisconnectPlan () {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout)
    }
  }

  async connectDb () {
    throw new NotImplemented()
  }

  async connect () {
    if (!this.connected) {
      this.connecting = true
      trace(`Connecting to ${this.props.driver} database`)
      await this.connectDb()
      this.connected = true
      this.connecting = false
      debug(`Connected to ${this.props.driver} database`)
    }
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
    this.cancelDisconnectPlan()
    if (this.connected) {
      await this.disconnectDb()
      this.connected = false
      debug(`Disconnected from ${this.props.driver} database`)
    }
  }

  async disconnectDb () {
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
    debug(str)
    const res = await this.queryDb(str)
    this.planDisconnect()
    return res
  }

  async exec (str) {
    await this.waitForConnection()
    debug(str)
    const res = await this.execDb(str)
    this.planDisconnect()
    return res
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
