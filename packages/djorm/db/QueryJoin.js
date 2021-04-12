const { And } = require('./And')
const { Q } = require('./QueryCondition')
const { QueryIdentifier } = require('./QueryIdentifier')

class QueryJoin extends QueryIdentifier {
  static left = 'LEFT'
  static right = 'RIGHT'
  static inner = 'INNER'

  constructor ({ conditions, ...props }) {
    super({
      ...props,
      conditions: conditions instanceof Q ? conditions : new And(conditions)
    })
  }

  get side () {
    return this.props.side || this.constructor.inner
  }
}

module.exports = { QueryJoin }
