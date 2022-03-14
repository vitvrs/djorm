const { SqlFormatter } = require('djorm-db-sql')
const { QueryArray } = require('djorm/db/QueryArray')
const { QueryColumn } = require('djorm/db/QueryColumn')

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

  formatConditionExpression (qs, condition, fieldSpec, value) {
    if (value instanceof QueryArray) {
      const fieldName = fieldSpec.replace(this.operatorMatch, '')
      const col = new QueryColumn(fieldName)
      if (!col.source) {
        col.props.source = qs.props.target
      }
      const field = this.formatQueryColumn(col, true)
      return `${value.value
        .map(value => {
          const formattedValue =
            typeof value === 'string' ? `"${value}"` : value
          return `${field} GLOB '*${formattedValue}[],]*'`
        })
        .join(' AND ')}`
    }
    return super.formatConditionExpression(qs, condition, fieldSpec, value)
  }

  formatValue (value) {
    return super.formatValue(
      value instanceof QueryArray ? JSON.stringify(value.value) : value
    )
  }
}

module.exports = { SqliteFormatter }
