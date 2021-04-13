const { PropModel } = require('./props')
const { NotImplemented } = require('../errors')

class Database extends PropModel {
  connected = false

  async connect () {
    throw new NotImplemented()
  }

  async disconnect () {
    throw new NotImplemented()
  }

  async query (str) {
    console.log(str)
    return await this.queryDb(str)
  }

  async queryDb () {
    throw new NotImplemented()
  }
}

module.exports = { Database }
