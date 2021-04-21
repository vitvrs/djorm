const { QueryIdentifier } = require('./QueryIdentifier')

class QueryFunc extends QueryIdentifier {
  get args () {
    return this.props.args
  }
}

module.exports = { QueryFunc }
