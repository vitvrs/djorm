const { Duplex } = require('stream')

/** Datastore Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class DatastoreReader extends Duplex {
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
      const createQuery = this.driver.formatQuery(this.query)
      this.dbStream = createQuery()
        .runStream()
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

module.exports = { DatastoreReader }
