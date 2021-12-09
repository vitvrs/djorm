const { TrivialField } = require('./TrivialField')
const { ValueError } = require('../errors')

/** Field used for float values */
class FloatField extends TrivialField {
  parse (value) {
    if (value) {
      const parsed = parseFloat(value)
      if (isNaN(parsed)) {
        throw new ValueError(`Cannot parse float value from "${value}"`)
      }
      return super.parse(parsed)
    }
    return super.parse(value)
  }
}

module.exports = { FloatField }
