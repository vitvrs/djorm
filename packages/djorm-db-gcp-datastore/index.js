const { NotImplemented } = require('djorm/errors')
const { Database } = require('djorm/db/Database')
const { Datastore } = require('@google-cloud/datastore')

class DatastoreDatabase extends Database {
  db = null

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

  async queryDb (qs) {
    const [result] = await this.db.runQuery(this.createQuery(qs))
    return result
  }

  createQuery (qs) {
    const query = this.db.createQuery(this.namespace, qs.props.target)
    return query
  }

  formatQuery (qs) {
    return qs
  }

  stream (qs) {
    return this.createQuery(qs).runStream()
  }
}

module.exports = DatastoreDatabase
