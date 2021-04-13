const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')

const sqlite = require('better-sqlite3')

class SqliteDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  get path () {
    return this.props.path
  }

  async connect () {
    this.db = sqlite(this.path)
    this.connected = true
  }

  async disconnect () {
    this.db = null
    this.connected = false
  }

  async execDb (str) {
    return this.db.prepare(str).run()
  }

  async queryDb (str) {
    return this.db.prepare(str).all()
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }
}

module.exports = SqliteDatabase
