const { DatabaseMapper } = require('./DatabaseMapper')
const { NotImplemented } = require('../errors')
const { DriverModel } = require('../models/DriverModel')
const { debug, trace } = require('../logger')

class Database extends DriverModel {
  connected = false
  connecting = false
  disconnectTimeout = null
  Mapper = DatabaseMapper
  mergeNestedModels = false

  constructor (...args) {
    super(...args)
    this.queue = []
    this.disconnect = this.disconnect.bind(this)
  }

  getSchema () {
    return this.props.schema
  }

  planDisconnect () {
    this.cancelDisconnectPlan()
    const maxAge = this.getProp('connectionMaxAge', 0)
    if (maxAge !== null) {
      this.disconnectTimeout = setTimeout(this.disconnect, maxAge)
    }
  }

  cancelDisconnectPlan () {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout)
    }
  }

  createWriteStream () {
    throw new NotImplemented()
  }

  async connectDb () {
    throw new NotImplemented()
  }

  async connect () {
    if (!this.connected) {
      this.connecting = true
      if (!this.connectPromise) {
        trace(`Connecting to ${this.constructor.name}`)
        this.connectPromise = this.connectDb()
      }
      await this.connectPromise
      this.connectPromise = null
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
      this.connected = false
      await this.disconnectDb()
      debug(`Disconnected from ${this.props.driver} database`)
    }
  }

  async reconnect () {
    await this.disconnect()
    await this.connect()
  }

  async disconnectDb () {
    throw new NotImplemented()
  }

  async runDatabaseOperation (op) {
    try {
      await this.waitForConnection()
      const result = await op()
      this.planDisconnect()
      return result
    } catch (e) {
      const ErrorType = this.resolveErrorType(e)
      if (ErrorType) {
        throw this.retypeError(e, ErrorType)
      }
      throw e
    }
  }

  resolveErrorType () {
    return null
  }

  retypeError () {
    throw new NotImplemented()
  }

  async waitForConnection () {
    this.cancelDisconnectPlan()
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
    debug(str)
    return await this.queryDb(str)
  }

  async exec (str) {
    debug(str)
    return await this.execDb(str)
  }

  async execDb () {
    throw new NotImplemented()
  }

  async queryDb () {
    throw new NotImplemented()
  }

  stream (qs) {
    return this.streamDb(qs)
  }

  streamDb (qs) {
    throw new NotImplemented()
  }

  parseValue (field, value) {
    if (this.parser) {
      return this.parser.parseValue(field, value)
    }
    return value
  }
}

module.exports = { Database }
