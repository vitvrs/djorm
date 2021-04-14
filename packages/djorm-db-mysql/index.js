const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')

const mysql = require('mysql')

class MysqlDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  get path () {
    return this.props.path
  }

  async connect () {
    this.db = mysql.createConnection({
      database: this.props.database,
      host: this.props.hostname,
      password: this.props.password,
      socketPath: this.props.socketPath,
      user: this.props.username,
      port: this.props.port
    })
    await new Promise((resolve, reject) => {
      this.db.connect(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    this.connected = true
  }

  async disconnect () {
    await new Promise((resolve, reject) => {
      this.db.end(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    this.db = null
    this.connected = false
  }

  async execDb (str) {
    return this.queryDb(str)
  }

  async queryDb (str) {
    return await new Promise((resolve, reject) => {
      this.db.query(str, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }
}

module.exports = MysqlDatabase
