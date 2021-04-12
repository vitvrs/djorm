const { TrivialField } = require('./TrivialField')

/** Field used for boolean values */
class BooleanField extends TrivialField {
  db = true

  parse (value) {
    return Boolean(value)
  }
}

module.exports = { BooleanField }
