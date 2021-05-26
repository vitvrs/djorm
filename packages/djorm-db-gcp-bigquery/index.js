const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')
const { BigQuery } = require('@google-cloud/bigquery')

/** @typedef BigQueryDatabaseConfig
 * @property {string} driver      Driver to use, 'djorm-db-gcp-bigquery'
 * @property {string} [dataset]   Dataset name to use
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
 *       dataset: 'my-dataset',
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
  formatter = new SqlFormatter()
  db = null

  get config () {
    return {
      projectId: this.props.projectId,
      credentials: {
        client_email: this.props.username,
        private_key: this.props.password
      }
    }
  }

  async connectDb () {
    this.db = new BigQuery(this.config)
    this.connected = true
  }

  async disconnectDb () {
    this.db = null
    this.connected = false
  }

  async execDb (str) {
    return await this.queryDb(str)
  }

  async queryDb (str) {
    const [result] = await this.db.query(str)
    return result
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  streamDb (qs) {
    return this.db.createQueryStream(this.formatQuery(qs))
  }
}

module.exports = BigQueryDatabase
