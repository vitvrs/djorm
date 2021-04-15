const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')

const mysql = require('mysql')

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

  async connect () {
    this.db = mysql.createConnection({
      database: this.props.database,
      host: this.props.hostname,
      password: this.props.password,
      socketPath: this.props.socketPath,
      user: this.props.username,
      port: this.props.port
    })
    await promise(this.db.connect, this.db)
    this.connected = true
  }

  async disconnect () {
    await promise(this.db.end, this.db)
    this.db = null
    this.connected = false
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

  stream (query) {
    return this.db.query(query).stream()
  }
}

module.exports = MysqlDatabase
