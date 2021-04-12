const { TrivialField } = require('./TrivialField')
const { ValueError } = require('../errors')

/** Field used for integer values */
class IntegerField extends TrivialField {
  parse (value) {
    if (value) {
      const parsed = parseInt(value, 10)
      if (isNaN(parsed)) {
        throw new ValueError(`Cannot parse integer value from "${value}"`)
      }
      return super.parse(parsed)
    }
    return super.parse(value)
  }
}

module.exports = { IntegerField }
