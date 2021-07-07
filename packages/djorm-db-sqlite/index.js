const { Database } = require('djorm/db/Database')
const { SqlFormatter } = require('djorm-db-sql')
const { Readable, Writable } = require('stream')

const errors = require('djorm/db/errors')
const sqlite = require('better-sqlite3')

class SqliteWriter extends Writable {
  constructor (base, model) {
    super({ objectMode: true })
    this.base = base
    this.model = model
    this.saveChunkItem = this.saveChunkItem.bind(this)
  }

  async saveChunkItem (item) {
    const inst = item instanceof this.model ? item : this.model.from(item)
    return await inst.save()
  }

  async _write (chunk, enc, next) {
    try {
      await (chunk instanceof Array
        ? Promise.all(chunk.map(this.saveChunkItem))
        : this.saveChunkItem(chunk))
      next()
    } catch (e) {
      next(e)
    }
  }
}

/** SQLite Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class SqliteReadStream extends Readable {
  constructor (driver, query) {
    super({ objectMode: true })
    this.driver = driver
    this.query = query
  }

  async prepare () {
    if (!this.iterator) {
      await this.driver.waitForConnection()
      this.iterator = this.driver.db.prepare(this.query).iterate()
    }
  }

  async _read () {
    await this.prepare()
    const result = this.iterator.next()
    this.push(result.done ? null : result.value)
  }
}

class SqliteDatabase extends Database {
  formatter = new SqlFormatter()
  db = null

  errorCodeMap = {
    SQLITE_CONSTRAINT_FOREIGNKEY: errors.RecordIsReferenced
  }

  get path () {
    return this.props.path
  }

  createWriteStream (model) {
    return new SqliteWriter(this, model)
  }

  async connectDb () {
    this.db = sqlite(this.path)
  }

  async disconnectDb () {
    this.db = null
  }

  async execDb (str) {
    return await this.runDatabaseOperation(() => {
      const result = this.db.prepare(str).run()
      return {
        ...result,
        changes: result.changes,
        insertId: result.lastInsertRowid
      }
    })
  }

  async queryDb (str) {
    return await this.runDatabaseOperation(() => this.db.prepare(str).all())
  }

  resolveErrorType (e) {
    return e && this.errorCodeMap[e.code]
  }

  retypeError (e, ErrorType) {
    const typed = new ErrorType(e.message)
    typed.stack = e.stack
    return typed
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  streamDb (qs) {
    return new SqliteReadStream(this, this.formatQuery(qs))
  }
}

module.exports = SqliteDatabase
