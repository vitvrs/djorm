const { Query } = require('./Query')

class Update extends Query {
  values (values) {
    return this.setProp('values', values)
  }
}

module.exports = {
  Update
}
