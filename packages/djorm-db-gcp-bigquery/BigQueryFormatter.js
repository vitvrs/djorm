const { QueryArray } = require('djorm/db/QueryArray')
const { SqlFormatter } = require('djorm-db-sql')

class BigQueryFormatter extends SqlFormatter {
  escapeChar (char) {
    switch (char) {
      case '\0':
      case '\x1a':
      case '%':
        return char
      default:
        return super.escapeChar(char)
    }
  }

  formatValue (value) {
    return super.formatValue(value instanceof QueryArray ? value.value : value)
  }
}

module.exports = { BigQueryFormatter }
