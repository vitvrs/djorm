const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { Q } = require('djorm/db/QueryCondition')
const { QueryFormatter } = require('djorm/db/QueryFormatter')

class DatastoreFormatterBase extends QueryFormatter {
  constructor (db) {
    super()
    this.db = db
  }

  formatKey (model, pk) {
    return this.db.key([model.table, pk])
  }

  formatValue (qs, data) {
    return {
      key: this.formatKey(qs.props.model, data[qs.props.model.pkName]),
      data
    }
  }

  formatValues (qs) {
    return qs.props.values instanceof Array
      ? qs.props.values.map(data => this.formatValue(qs, data))
      : [this.formatValue(qs, qs.props.values)]
  }

  mapConditionExpression = (query, condition, fieldSpec, value) => {
    const operatorName = this.resolveOperatorName(condition, fieldSpec)
    const operator = ComparisonOperator[operatorName]
    const fieldName = fieldSpec.replace(this.operatorMatch, '')
    return this.mapCondition(query, fieldName, operator, value)
  }

  mapSubCondition = (query, condition, conditionProps) => {
    if (conditionProps instanceof Q) {
      conditionProps.parent(condition)
      return this.mapQueryCondition(query, conditionProps)
    }
    return Object.entries(conditionProps).reduce(
      (aggr, [fieldSpec, value]) =>
        this.mapConditionExpression(query, condition, fieldSpec, value),
      query
    )
  }

  mapQueryCondition = (query, condition) => {
    return condition.conditions.reduce(
      (aggr, c) => this.mapSubCondition(aggr, condition, c),
      query
    )
  }

  mapQueryConditions = (query, conditions) => {
    return conditions.reduce(
      (aggr, condition) => this.mapQueryCondition(aggr, condition),
      query
    )
  }

  mapFilter = (qs, query) => {
    if (qs.props.conditions) {
      return this.mapQueryConditions(query, qs.props.conditions)
    }
    return query
  }
}

module.exports = { DatastoreFormatterBase }
