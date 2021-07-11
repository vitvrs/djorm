const { Duplex } = require('stream')

/** Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class BigQueryReader extends Duplex {
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
        .createQueryStream(this.driver.formatQuery(this.query))
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

module.exports = { BigQueryReader }
