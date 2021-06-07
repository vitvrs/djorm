const { Delete } = require('djorm/db/Delete')
const { Insert } = require('djorm/db/Insert')
const { QueryFormatterError } = require('djorm/db/errors')
const { QueryFormatter } = require('djorm/db/QueryFormatter')
const { Select } = require('djorm/db/Select')
const { SqlDeleteFormatter } = require('./SqlDeleteFormatter')
const { SqlInsertFormatter } = require('./SqlInsertFormatter')
const { SqlSelectFormatter } = require('./SqlSelectFormatter')
const { SqlUpdateFormatter } = require('./SqlUpdateFormatter')
const { Update } = require('djorm/db/Update')

class SqlFormatter extends QueryFormatter {
  formatQuery (qs) {
    if (qs instanceof Select) {
      return new SqlSelectFormatter().formatQuery(qs)
    }
    if (qs instanceof Insert) {
      return new SqlInsertFormatter().formatQuery(qs)
    }
    if (qs instanceof Update) {
      return new SqlUpdateFormatter().formatQuery(qs)
    }
    if (qs instanceof Delete) {
      return new SqlDeleteFormatter().formatQuery(qs)
    }
    throw new QueryFormatterError('Unknown query type')
  }
}

module.exports = {
  SqlDeleteFormatter,
  SqlFormatter,
  SqlInsertFormatter,
  SqlSelectFormatter,
  SqlUpdateFormatter
}
