const { TextField } = require('./TextField')
const { ValueError } = require('../errors')

class JsonField extends TextField {
  indexable = false

  toJson (value) {
    return typeof value === 'string' || value === null
      ? value
      : JSON.stringify(value)
  }

  toDb (value) {
    return super.toDb(this.toJson(value))
  }

  serialize (value) {
    return super.serialize(this.toJson(value))
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

  fromDb (value, inst) {
    return this.parse(super.fromDb(value, inst), inst)
  }
}

module.exports = { JsonField }
