const { SqlFormatter } = require('djorm-db-sql')
const { QueryArray } = require('djorm/db/QueryArray')

class MysqlFormatter extends SqlFormatter {
  formatValue (value) {
    return super.formatValue(
      value instanceof QueryArray ? JSON.stringify(value.value) : value
    )
  }
}

module.exports = { MysqlFormatter }
