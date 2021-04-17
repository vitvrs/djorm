const { ComparisonOperator } = require('./ComparisonOperator')
const { QueryError } = require('./errors')

class QueryFormatter {
  operatorMatch = new RegExp(
    `__(${Object.keys(ComparisonOperator).join('|')})$`
  )

  escapeString (value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, function (char) {
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
        case '"':
        case "'":
        case '\\':
        case '%':
          // prepends a backslash to backslash, percent,
          // and double/single quotes
          return '\\' + char
        default:
          return char
      }
    })
  }

  formatValue (value) {
    if (typeof value === 'number') {
      return String(value)
    }
    if (typeof value === 'string') {
      return `'${this.escapeString(value)}'`
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0'
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
