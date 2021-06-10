const { Database } = require('djorm/db/Database')
const { Duplex } = require('stream')
const { SqlFormatter } = require('djorm-db-sql')

const mysql = require('mysql')

/** MySQL Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class MysqlReadStream extends Duplex {
  /**
   * @param {Database} driver
   * @param {Query} query
   */
  constructor (driver, query) {
    super({ objectMode: true })
    this.driver = driver
    this.query = query
  }

  async _read () {
    if (!this.dbStream) {
      await this.driver.waitForConnection()
      this.dbStream = this.driver.db
        .query(this.query)
        .stream()
        .pipe(this)
      this.dbStream.on('finish', () => this.push(null))
      this.dbStream.on('error', err => this.destroy(err))
    }
  }

  _write (chunk, enc, next) {
    this.push(chunk)
    next()
  }
}

const promise = async (fn, context, ...args) =>
  await new Promise((resolve, reject) => {
    fn.call(
      context,
      ...[
        ...args,
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        }
      ]
    )
  })

class MysqlDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  async connectDb () {
    this.db = mysql.createConnection({
      database: this.props.database,
      host: this.props.hostname,
      password: this.props.password,
      socketPath: this.props.socketPath,
      user: this.props.username,
      port: this.props.port,
      timezone: this.props.timezone
    })
    await promise(this.db.connect, this.db)
  }

  async disconnectDb () {
    let db = this.db
    this.db = null
    await promise(db.end, db)
    db = null
  }

  async execDb (str) {
    return this.queryDb(str)
  }

  async queryDb (str) {
    return await promise(this.db.query, this.db, str)
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  streamDb (qs) {
    return new MysqlReadStream(this, this.formatQuery(qs))
  }
}

module.exports = MysqlDatabase
