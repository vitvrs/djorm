const { ImmutablePropModel } = require('./props')

const QuerySetMode = {
  delete: 'DELETE',
  select: 'SELECT',
  update: 'UPDATE'
}

class Query extends ImmutablePropModel {
  static fromDb (db) {
    return new this({ db })
  }

  get db () {
    return this.props.db
  }
}

module.exports = {
  Query,
  QuerySetMode
}
