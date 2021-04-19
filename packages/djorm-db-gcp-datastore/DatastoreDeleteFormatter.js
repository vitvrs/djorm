const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { QueryFormatter } = require('djorm/db/QueryFormatter')
const { NotImplemented } = require('djorm/errors')
const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreDeleteFormatter extends DatastoreFormatterBase {
  constructor (db) {
    super()
    this.db = db
  }

  formatQuery (qs) {
    return async () => {
      await this.db.delete(this.mapFilter(qs, { qs }))
    }
  }

  mapCondition = (query, fieldName, operator, value) => {
    if (operator !== ComparisonOperator.eq) {
      throw new NotImplemented(
        'Datastore db support only eq operator for deletion'
      )
    }
    if (fieldName !== query.qs.props.model.pkName) {
      throw new NotImplemented(
        `Datastore delete can filter only by primary keys, but "${fieldName}" was given`
      )
    }
    return this.db.key([query.qs.props.model.table, value])
  }
}

module.exports = { DatastoreDeleteFormatter }
