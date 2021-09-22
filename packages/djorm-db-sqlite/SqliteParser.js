const { ArrayField } = require('djorm/fields/ArrayField')

class SqliteParser {
  parseValue (field, value) {
    if (!value) {
      return null
    }
    if (field instanceof ArrayField) {
      return JSON.parse(value)
    }
    return value
  }
}

module.exports = { SqliteParser }
