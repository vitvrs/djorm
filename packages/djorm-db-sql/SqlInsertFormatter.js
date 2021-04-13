const { SqlFormatterBase } = require('./SqlFormatterBase')

class SqlInsertFormatter extends SqlFormatterBase {
  formatQuery (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatTarget(qs),
      this.formatValues(qs)
    )
  }

  formatHeader (qs) {
    return 'INSERT'
  }

  formatTarget (qs) {
    return `INTO ${this.formatSafeName(qs.props.target)}`
  }

  formatValues (qs) {
    const values = qs.props.values
    const fields = Object.keys(values).filter(
      key => typeof values[key] !== 'undefined'
    )
    return `(${fields.map(this.formatSafeName).join(',')}) VALUES (${fields.map(
      field => this.formatValue(values[field])
    )})`
  }
}

module.exports = {
  SqlInsertFormatter
}
