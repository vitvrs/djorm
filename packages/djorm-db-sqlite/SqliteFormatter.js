const { SqlFormatter } = require('djorm-db-sql')

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
}

module.exports = { SqliteFormatter }
