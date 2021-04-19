const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreUpdateFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => await this.db.update(this.formatValues(qs))
  }
}

module.exports = { DatastoreUpdateFormatter }
