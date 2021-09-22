const { SqlFormatter } = require('djorm-db-sql')
const { QueryArray } = require('djorm/db/QueryArray')

class SqliteFormatter extends SqlFormatter {
  escapeChar (char) {
    if (char === "'") {
      return "''"
    }
    if (char === '\\') {
      return '\\'
    }
    return super.escapeChar(char)
  }

  formatValue (value) {
    return super.formatValue(
      value instanceof QueryArray ? JSON.stringify(value.value) : value
    )
  }
}

module.exports = { SqliteFormatter }
