const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')
const { BigQuery } = require('@google-cloud/bigquery')

class BigQueryDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  get config () {
    return {
      projectId: this.props.projectId,
      credentials: this.props.credentials
    }
  }

  async connect () {
    this.db = new BigQuery(this.cfg)
    this.connected = true
  }

  async disconnect () {
    this.db = null
    this.connected = false
  }

  async execDb (str) {
    return this.queryDb(str)
  }

  async queryDb (str) {
    const [result] = await this.db.query(str)
    return result
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  stream (qs) {
    const datasetId = this.parseDatasetId(qs.props.source)
    const tableId = this.parseTableId(qs.props.source)
    return this.db
      .dataset(datasetId)
      .table(tableId)
      .createQueryStream(this.formatter.formatQuery(qs))
  }
}

module.exports = BigQueryDatabase
