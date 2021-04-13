const { SqlFormatterBase } = require('./SqlFormatterBase')

class SqlUpdateFormatter extends SqlFormatterBase {
  formatQuery (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatTarget(qs),
      this.formatValues(qs),
      this.formatWhere(qs)
    )
  }

  formatHeader (qs) {
    return 'UPDATE'
  }

  formatTarget (qs) {
    return this.formatSafeName(qs.props.target)
  }

  formatValues (qs) {
    const values = qs.props.values
    const valuesStr = Object.keys(values)
      .filter(key => typeof values[key] !== 'undefined')
      .map(
        field =>
          `${this.formatSafeName(field)} = ${this.formatValue(values[field])}`
      )
      .join(', ')
    return `SET ${valuesStr}`
  }
}

module.exports = {
  SqlUpdateFormatter
}
