const { Delete } = require('djorm/db/Delete')
const { Insert } = require('djorm/db/Insert')
const { QueryFormatterError } = require('djorm/db/errors')
const { QueryFormatter } = require('djorm/db/QueryFormatter')
const { Select } = require('djorm/db/Select')
const { Update } = require('djorm/db/Update')

class DatastoreFormatter extends QueryFormatter {
  constructor (db) {
    super()
    this.db = db
  }

  requireFormatter = Model => new (require(`./${Model}`)[Model])(this.db)

  formatQuery (qs) {
    if (qs instanceof Select) {
      return this.requireFormatter('DatastoreSelectFormatter').formatQuery(qs)
    }
    if (qs instanceof Insert) {
      return this.requireFormatter('DatastoreInsertFormatter').formatQuery(qs)
    }
    if (qs instanceof Update) {
      return this.requireFormatter('DatastoreUpdateFormatter').formatQuery(qs)
    }
    if (qs instanceof Delete) {
      return this.requireFormatter('DatastoreDeleteFormatter').formatQuery(qs)
    }
    throw new QueryFormatterError('Unknown query type')
  }
}

module.exports = { DatastoreFormatter }
