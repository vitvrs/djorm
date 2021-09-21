const { TrivialField } = require('./TrivialField')

/** Field used for char values */
class CharField extends TrivialField {
  parse (value, inst) {
    if (value === null || value === undefined) {
      return null
    }
    return String(value)
  }
}

module.exports = { CharField }
