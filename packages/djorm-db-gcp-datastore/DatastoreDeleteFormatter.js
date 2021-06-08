const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { NotImplemented } = require('djorm/errors')
const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreDeleteFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => {
      await this.driver.waitForConnection()
      await this.db.delete(this.mapFilter(qs, { qs }))
    }
  }

  mapCondition = (qs, query, fieldName, operator, value) => {
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
    return this.formatKey(query.qs.props.model, value)
  }
}

module.exports = { DatastoreDeleteFormatter }
