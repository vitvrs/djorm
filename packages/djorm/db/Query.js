const { ImmutablePropModel } = require('./props')

const QuerySetMode = {
  delete: 'DELETE',
  select: 'SELECT',
  update: 'UPDATE'
}

class Query extends ImmutablePropModel {}

module.exports = {
  Query,
  QuerySetMode
}
