const { Readable } = require('stream')

/** SQLite Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class SqliteReader extends Readable {
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

module.exports = { SqliteReader }
