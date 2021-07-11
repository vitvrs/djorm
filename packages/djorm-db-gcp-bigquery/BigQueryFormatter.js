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
}

module.exports = { BigQueryFormatter }
