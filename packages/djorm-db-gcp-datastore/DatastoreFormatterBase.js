const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { Q } = require('djorm/db/QueryCondition')
const { QueryArray } = require('djorm/db/QueryArray')
const { QueryFormatter } = require('djorm/db/QueryFormatter')

const filterNonEmpty = item => typeof item !== 'undefined'

class DatastoreFormatterBase extends QueryFormatter {
  constructor (driver) {
    super()
    this.driver = driver
  }

  get db () {
    return this.driver.db
  }

  getKeyValue (item) {
    return item && item.key && (item.key.id || item.key.name)
  }

  formatKey (model, pk) {
    return this.db.key([model.table, pk])
  }

  formatValue (value) {
    if (value instanceof QueryArray) {
      return value.value
    }
    return value
  }

  formatEntityProps (data) {
    return Object.entries(data).reduce(
      (aggr, [fieldName, value]) =>
        Object.assign(aggr, { [fieldName]: this.formatValue(value) }),
      data
    )
  }

  formatEntity (qs, entityData) {
    const excludeFromIndexes = qs.props.model
      .getDatabaseFields()
      .filter(([key, field]) => !field.indexable)
      .map(([key]) => key)
    const data = this.formatEntityProps(entityData)
    const key = this.formatKey(qs.props.model, data[qs.props.model.pkName])
    return {
      key,
      data,
      excludeLargeProperties: true,
      excludeFromIndexes
    }
  }

  formatValues (qs) {
    return qs.props.values instanceof Array
      ? qs.props.values.map(data => this.formatEntity(qs, data))
      : [this.formatEntity(qs, qs.props.values)]
  }

  mapConditionExpression = (qs, query, condition, fieldSpec, value) => {
    const operatorName = this.resolveOperatorName(condition, fieldSpec)
    const operator = ComparisonOperator[operatorName]
    const fieldName = fieldSpec.replace(this.operatorMatch, '')
    return this.mapCondition(qs, query, fieldName, operator, value)
  }

  mapSubCondition = (qs, query, condition, conditionProps) => {
    if (conditionProps instanceof Q) {
      conditionProps.parent(condition)
      return this.mapQueryCondition(qs, query, conditionProps)
    }
    return Object.entries(conditionProps).reduce(
      (aggr, [fieldSpec, value]) =>
        filterNonEmpty(value)
          ? this.mapConditionExpression(qs, query, condition, fieldSpec, value)
          : aggr,
      query
    )
  }

  mapQueryCondition = (qs, query, condition) => {
    return condition.conditions
      .filter(filterNonEmpty)
      .reduce((aggr, c) => this.mapSubCondition(qs, aggr, condition, c), query)
  }

  mapQueryConditions = (qs, query, conditions) => {
    return conditions
      .filter(filterNonEmpty)
      .reduce(
        (aggr, condition) => this.mapQueryCondition(qs, aggr, condition),
        query
      )
  }

  mapFilter = (qs, query) => {
    if (qs.props.conditions) {
      return this.mapQueryConditions(qs, query, qs.props.conditions)
    }
    return query
  }
}

module.exports = { DatastoreFormatterBase }
