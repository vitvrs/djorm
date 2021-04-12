const { PropModel } = require('./props')

class QueryIdentifier extends PropModel {
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
