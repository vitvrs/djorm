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
    return this.db.query(this.formatQuery(qs)).stream()
  }
}

module.exports = MysqlDatabase
