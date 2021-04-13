const { And } = require('./And')
const { DatabaseModelBase } = require('../models/DatabaseModelBase')
const { ImmutablePropModel } = require('./props')
const { Q } = require('./QueryCondition')

const defaultConditions = () => []

class Query extends ImmutablePropModel {
  static fromDb (db) {
    return new this({ db })
  }

  get db () {
    return this.props.db
  }

  get model () {
    return this.getProp('model')
  }

  filter (props) {
    return this.initProp('conditions', defaultConditions).appendProp(
      'conditions',
      props instanceof Q ? props : new And(props)
    )
  }

  target (value) {
    if (value.prototype && value.prototype instanceof DatabaseModelBase) {
      const [selection] = this.getModelFields(value)
      return this.setProp('target', value.table)
        .setProp('selection', selection, true)
        .setProp('model', value, true)
    }
    return this.setProp('target', value)
  }
}

module.exports = {
  Query
}
