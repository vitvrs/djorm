const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { Q } = require('djorm/db/QueryCondition')
const { QueryFormatter } = require('djorm/db/QueryFormatter')

class DatastoreSelectFormatter extends QueryFormatter {
  constructor (db) {
    super()
    this.db = db
  }

  formatQuery (qs) {
    return () =>
      [this.mapFilter, this.mapOrderBy, this.mapLimit, this.mapOffset].reduce(
        (aggr, modifier) => modifier(qs, aggr),
        this.db.createQuery(this.db.namespace, qs.props.target)
      )
  }

  mapConditionExpression = (query, condition, fieldSpec, value) => {
    const operatorName = this.resolveOperatorName(condition, fieldSpec)
    const operator = ComparisonOperator[operatorName]
    const fieldName = fieldSpec.replace(this.operatorMatch, '')
    return query.filter(fieldName, operator, value)
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

  mapOrderByDirective = (query, oi) => {
    const [name, descending] = this.parseOrderDirective(oi)
    return query.order(name, { descending })
  }

  mapOrderBy = (qs, query) => {
    if (qs.props.orderBy) {
      return qs.props.orderBy.reduce(
        (q, expr) => this.mapOrderByDirective(q, expr),
        query
      )
    }
    return query
  }

  mapLimit = (qs, query) => {
    return qs.props.limit ? query.limit(qs.props.limit) : query
  }

  mapOffset = (qs, query) => {
    return qs.props.offset ? query.offset(qs.props.offset) : query
  }
}

module.exports = { DatastoreSelectFormatter }
