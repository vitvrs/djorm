const { TextField } = require('./TextField')
const { ValueError } = require('../errors')

class JsonField extends TextField {
  indexable = false

  toDb (value) {
    return typeof value === 'string' ? value : JSON.stringify(value)
  }

  parse (value) {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch (e) {
      const err = new ValueError(e.message)
      err.parentError = e
      throw err
    }
  }

  fromDb (value) {
    return this.parse(super.fromDb(value))
  }
}

module.exports = { JsonField }
