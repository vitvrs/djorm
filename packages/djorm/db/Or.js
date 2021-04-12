const { LogicOperator } = require('./LogicOperator')
const { QueryCondition } = require('./QueryCondition')

class Or extends QueryCondition {
  constructor (...conditions) {
    super(...conditions)
    this.setProp('operator', LogicOperator.or, true)
  }
}

module.exports = {
  Or
}
