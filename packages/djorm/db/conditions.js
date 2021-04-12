const { ImmutablePropModel } = require('./props')

const LogicOperator = {
  and: 'AND',
  or: 'OR'
}

const ValueOperator = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  neq: '!=',
  in: 'IN',
  notin: 'NOT IN'
}

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
const And = QueryCondition

class Or extends QueryCondition {
  constructor (...conditions) {
    super(...conditions)
    this.setProp('operator', LogicOperator.or, true)
  }
}

module.exports = {
  LogicOperator,
  ValueOperator,
  Q,
  And,
  Or
}
