const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreUpdateFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => {
      await this.driver.waitForConnection()
      const [result] = await this.db.upsert(this.formatValues(qs))
      return {
        changes: result.indexUpdates
      }
    }
  }
}

module.exports = { DatastoreUpdateFormatter }
