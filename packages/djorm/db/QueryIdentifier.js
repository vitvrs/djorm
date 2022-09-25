const { ImmutablePropModel } = require('../models/PropModel')

class QueryIdentifier extends ImmutablePropModel {
  get name () {
    return this.props.name
  }

  get alias () {
    return this.props.alias
  }

  get prefix () {
    return this.props.prefix
  }
}

module.exports = { QueryIdentifier }
