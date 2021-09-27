const { ArrayField } = require('djorm/fields/ArrayField')

class MysqlParser {
  parseValue (field, value) {
    if (field instanceof ArrayField) {
      return JSON.parse(value)
    }
    return value
  }
}

module.exports = { MysqlParser }
