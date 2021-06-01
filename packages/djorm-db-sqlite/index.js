const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')
const { Readable } = require('stream')

const sqlite = require('better-sqlite3')

class SqliteReadStream extends Readable {
  constructor (stmt) {
    super({ objectMode: true })
    this.iterator = stmt.iterate()
  }

  _read () {
    const result = this.iterator.next()
    this.push(result.done ? null : result.value)
  }
}

class SqliteDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  get path () {
    return this.props.path
  }

  async connectDb () {
    this.db = sqlite(this.path)
  }

  async disconnectDb () {
    this.db = null
  }

  async execDb (str) {
    const result = this.db.prepare(str).run()
    return {
      ...result,
      insertId: result.lastInsertRowid
    }
  }

  async queryDb (str) {
    return this.db.prepare(str).all()
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  streamDb (qs) {
    return new SqliteReadStream(this.db.prepare(this.formatQuery(qs)))
  }
}

module.exports = SqliteDatabase
