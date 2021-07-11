const moment = require('moment')

const { ComparisonOperator } = require('./ComparisonOperator')
const { QueryError } = require('./errors')

class QueryFormatter {
  operatorMatch = new RegExp(
    `__(${Object.keys(ComparisonOperator).join('|')})$`
  )

  escapeChar (char) {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case "'":
      case '\\':
      case '%':
        // prepends a backslash to backslash, percent,
        // and double/single quotes
        return '\\' + char
      default:
        return char
    }
  }

  escapeString (value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, this.escapeChar)
  }

  formatDate (value) {
    return `'${moment(value).format('YYYY-MM-DDTHH:mm:ss.SSS')}'`
  }

  formatString (value) {
    return `'${this.escapeString(value)}'`
  }

  formatValue (value) {
    if (value instanceof Date) {
      return this.formatDate(value)
    }
    if (typeof value === 'number') {
      return String(value)
    }
    if (typeof value === 'string') {
      return this.formatString(value)
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0'
    }
    if (value === null) {
      return 'NULL'
    }
    throw new QueryError(
      `Unknown value type: "${typeof value}" for value "${value}"`
    )
  }

  parseOrderDirective (oi) {
    const descending = oi.indexOf('-') === 0
    const name = descending ? oi.substr(1) : oi
    return [name, descending]
  }

  resolveOperatorName (condition, fieldSpec) {
    const operatorKey = fieldSpec.match(this.operatorMatch)
    const operatorName = (operatorKey && operatorKey[1]) || 'eq'
    return condition.shouldNegate()
      ? this.inverseOperator(operatorName)
      : operatorName
  }
}

module.exports = { QueryFormatter }
