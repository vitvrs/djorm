const { Query } = require('./Query')

class Insert extends Query {
  into (value) {
    return this.target(value)
  }

  values (values) {
    return this.setProp('values', values)
  }
}

module.exports = {
  Insert
}
