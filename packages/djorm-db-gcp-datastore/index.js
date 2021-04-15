const { NotImplemented } = require('djorm/errors')
const { Database } = require('djorm/db/Database')
const { Datastore } = require('@google-cloud/datastore')

class DatastoreDatabase extends Database {
  db = null

  get config () {
    return {
      projectId: this.props.projectId,
      credentials: this.props.credentials
    }
  }

  async connect () {
    this.db = new Datastore(this.cfg)
    this.connected = true
  }

  async disconnect () {
    this.db = null
    this.connected = false
  }

  async execDb (qs) {
    // TODO
    throw new NotImplemented()
  }

  async queryDb (qs) {
    const [result] = await this.db.runQuery(this.createQuery(qs))
    return result
  }

  createQuery (qs) {
    throw new NotImplemented()
  }

  formatQuery (qs) {
    return qs
  }

  stream (qs) {
    return this.createQuery(qs).runStream()
  }
}

module.exports = DatastoreDatabase
