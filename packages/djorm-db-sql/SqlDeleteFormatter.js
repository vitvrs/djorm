const { SqlFormatterBase } = require('./SqlFormatterBase')

class SqlDeleteFormatter extends SqlFormatterBase {
  formatQuery (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatTarget(qs),
      this.formatWhere(qs)
    )
  }

  formatHeader (qs) {
    return 'DELETE'
  }

  formatTarget (qs) {
    return `FROM ${this.formatSafeName(qs.props.target)}`
  }
}

module.exports = {
  SqlDeleteFormatter
}
