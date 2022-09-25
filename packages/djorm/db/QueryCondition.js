const { ImmutablePropModel } = require('../models/PropModel')
const { LogicOperator } = require('./LogicOperator')

class QueryCondition extends ImmutablePropModel {
  constructor (...conditions) {
    super({
      operator: LogicOperator.and,
      negate: false
    })
    this.conditions = conditions
  }

  negate (value) {
    return this.setProp('negate', Boolean(value), true)
  }

  parent (value) {
    return this.setProp('parent', value, true)
  }

  get operator () {
    return this.shouldNegate() ? this.negatedOperator : this.props.operator
  }

  get negatedOperator () {
    return this.props.operator === LogicOperator.and
      ? LogicOperator.or
      : LogicOperator.and
  }

  hasMultipleConditions () {
    return this.conditions.length > 1
  }

  isNegated () {
    return this.props.negate
  }

  hasNegatedParent () {
    return Boolean(this.props.parent && this.props.parent.props.negate)
  }

  shouldNegate () {
    return this.isNegated() || this.hasNegatedParent()
  }
}

const Q = QueryCondition

module.exports = {
  QueryCondition,
  Q
}
