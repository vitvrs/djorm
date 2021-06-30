const { BigQuery } = require('@google-cloud/bigquery')
const { Database } = require('djorm/db/Database')
const { Delete } = require('djorm/db/Delete')
const { Insert } = require('djorm/db/Insert')
const { Select } = require('djorm/db/Select')
const { Update } = require('djorm/db/Update')
const { Writable } = require('stream')
const {
  SqlFormatter,
  SqlSelectFormatter,
  SqlInsertFormatter,
  SqlUpdateFormatter,
  SqlDeleteFormatter
} = require('djorm-db-sql')

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

const escapeString = value => {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, function (char) {
    switch (char) {
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
        return '\\' + char
      default:
        return char
    }
  })
}

class BigQueryFormatter extends SqlFormatter {
  formatQuery (qs) {
    if (qs instanceof Select) {
      return new BigQuerySelectFormatter().formatQuery(qs)
    }
    if (qs instanceof Insert) {
      return new BigQueryInsertFormatter().formatQuery(qs)
    }
    if (qs instanceof Update) {
      return new BigQueryUpdateFormatter().formatQuery(qs)
    }
    if (qs instanceof Delete) {
      return new BigQueryDeleteFormatter().formatQuery(qs)
    }
    return super.formatQuery(qs)
  }
}

class BigQuerySelectFormatter extends SqlSelectFormatter {
  formatString (value) {
    return `'${escapeString(value)}'`
  }
}

class BigQueryInsertFormatter extends SqlInsertFormatter {
  formatString (value) {
    return `'${escapeString(value)}'`
  }
}

class BigQueryUpdateFormatter extends SqlUpdateFormatter {
  formatString (value) {
    return `'${escapeString(value)}'`
  }
}

class BigQueryDeleteFormatter extends SqlDeleteFormatter {
  formatString (value) {
    return `'${escapeString(value)}'`
  }
}

class BigQueryWriter extends Writable {
  constructor (base, model) {
    super({ objectMode: true })
    this.base = base
    this.model = model
  }

  formatChunk (chunk) {
    return chunk.serializeDbValues ? chunk.serializeDbValues() : chunk
  }

  async _write (chunk, enc, next) {
    try {
      await this.base.waitForConnection()
      const table = this.base.db.table(this.model.tableName)
      const data =
        chunk instanceof Array
          ? chunk.map(this.formatChunk)
          : this.formatChunk(chunk)
      await table.insert(data)
      next()
    } catch (e) {
      next(e)
    }
  }
}

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
