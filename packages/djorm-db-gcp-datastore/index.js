const { Database } = require('djorm/db/Database')
const { DatastoreMapper } = require('./DatastoreMapper')
const { DatastoreFormatter } = require('./DatastoreFormatter')
const { Datastore } = require('@google-cloud/datastore')
const { NotImplemented } = require('djorm/errors')

class DatastoreDatabase extends Database {
  db = null
  Mapper = DatastoreMapper
  Formatter = DatastoreFormatter

  get config () {
    return {
      apiEndpoint: this.props.apiEndpoint,
      credentials: this.props.credentials,
      namespace: this.namespace,
      projectId: this.props.projectId
    }
  }

  get namespace () {
    return this.props.namespace
  }

  async connect () {
    this.db = new Datastore(this.config)
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

  async queryDb (query) {
    const [result] = await this.db.runQuery(query())
    return result
  }

  formatQuery (qs) {
    return new this.Formatter(this.db).formatQuery(qs)
  }

  stream (query) {
    return query().runStream()
  }
}

module.exports = DatastoreDatabase
