const { TextField } = require('./TextField')

class JsonField extends TextField {
  indexable = false

  serialize (value) {
    return typeof value === 'string' ? value : JSON.stringify(value)
  }

  parse (value) {
    return typeof value === 'string' ? JSON.parse(value) : value
  }

  fromDb (value) {
    return this.parse(super.fromDb(value))
  }
}

module.exports = { JsonField }
