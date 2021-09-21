const { TrivialField } = require('./TrivialField')

/** Field used for char values */
class CharField extends TrivialField {
  parse (value, inst) {
    return String(value)
  }
}

module.exports = { CharField }
