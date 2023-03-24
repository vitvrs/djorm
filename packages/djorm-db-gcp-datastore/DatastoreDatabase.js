const { ComplexQuery } = require('./ComplexQuery')
const { Database } = require('djorm/db/Database')
const { DatastoreFormatter } = require('./DatastoreFormatter')
const { DatastoreMapper } = require('./DatastoreMapper')
const { Datastore } = require('@google-cloud/datastore')
const { DatastoreReader } = require('./DatastoreReader')
const { DatastoreWriter } = require('./DatastoreWriter')

class DatastoreDatabase extends Database {
  db = null
  Formatter = DatastoreFormatter
  Mapper = DatastoreMapper
  mergeNestedModels = true

  get config () {
    const config = {
      apiEndpoint: this.props.apiEndpoint,
      namespace: this.namespace
    }
    if (this.getProp('projectId')) {
      config.projectId = this.getProp('projectId')
    }
    if (this.getProp('clientEmail') || this.getProp('privateKey')) {
      config.client_email = this.getProp('clientEmail')
      config.private_key = this.getProp('privateKey')
    }
    return config
  }

  get namespace () {
    return this.props.namespace
  }

  async connectDb () {
    this.db = new Datastore(this.config)
  }

  async disconnectDb () {
    this.db = null
  }

  async execDb (query) {
    return await this.runDatabaseOperation(query)
  }

  async queryDb (configureQuery) {
    return await this.runDatabaseOperation(async () => {
      const query = configureQuery()
      if (query instanceof ComplexQuery) {
        return await query.run()
      }
      const [result] = await this.db.runQuery(query)
      return query.postprocess ? query.postprocess(result) : result
    })
  }

  formatQuery (qs) {
    return new this.Formatter(this).formatQuery(qs)
  }

  createWriteStream (model) {
    return new DatastoreWriter(this, model)
  }

  streamDb (qs) {
    return new DatastoreReader(this, qs)
  }
}

module.exports = DatastoreDatabase
