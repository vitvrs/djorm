const { Duplex } = require('stream')

/** MySQL Read Stream that initiates the database connection once the stream
 *  is used by piping or reading.
 */
class MysqlReader extends Duplex {
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

module.exports = { MysqlReader }
