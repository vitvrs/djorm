const { BigQueryFormatter } = require('./BigQueryFormatter')
const { BigQueryReader } = require('./BigQueryReader')
const { BigQuery } = require('@google-cloud/bigquery')
const { BigQueryWriter } = require('./BigQueryWriter')
const { DatabaseError } = require('djorm/db/errors')
const { Database } = require('djorm/db/Database')

/** @typedef BigQueryDatabaseConfig
 * @property {string} driver      Driver to use, 'djorm-db-gcp-bigquery'
 * @property {string} [schema]   Dataset name to use
 * @property {string} [location]  [BigQuery dataset location](https://cloud.google.com/bigquery/docs/locations) used when Djorm creates datasets. Uses BigQuery default if omitted.
 * @property {string} [password]  Password used to authenticate against BigQuery. It is read from environment if omitted.
 * @property {string} [projectId] Djorm will operate on this project ID. It is read from environment if omitted.
 * @property {string} [username]  Username used to authenticate against BigQuery. It is read from environment if omitted.
 * @example
 * ```javascript
 * const { configure } = require('djorm/config')
 * configure({
 *   databases: {
 *     default: {
 *       driver: 'djorm-db-gcp-bigquery',
 *       schema: 'my-dataset',
 *       location: 'EU',
 *       password: '-----BEGIN PRIVATE KEY-----\nmy-private-key...',
 *       projectId: 'my-project-id',
 *       username: 'my-service-account@my-project-id-as-usual.iam.gserviceaccount.com',
 *     }
 *   }
 * })
 * ```
 */

/** BigQueryDatabase BigQueryDatabaseConfig
 * @implements Database
 */
class BigQueryDatabase extends Database {
  formatter = new BigQueryFormatter()
  db = null

  get config () {
    return {
      location: this.props.location,
      projectId: this.props.projectId,
      credentials: {
        client_email: this.props.username,
        private_key: this.props.password
      }
    }
  }

  createWriteStream (model) {
    return new BigQueryWriter(this, model)
  }

  async connectDb () {
    this.db = new BigQuery(this.config)
  }

  async disconnectDb () {
    this.db = null
  }

  async execDb (str) {
    return await this.queryDb(str)
  }

  async queryDb (str) {
    return await this.runDatabaseOperation(async () => {
      const [result] = await this.db.query(str)
      return result
    })
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  getDataset (datasetName) {
    return this.db.dataset(datasetName)
  }

  getTable (tableName) {
    if (this.props.schema) {
      return this.getDataset(this.props.schema).table(tableName)
    }
    throw new DatabaseError(
      `Cannot resolve table ${tableName} without database schema defined.`
    )
  }

  streamDb (qs) {
    return new BigQueryReader(this, qs)
  }
}

module.exports = BigQueryDatabase
