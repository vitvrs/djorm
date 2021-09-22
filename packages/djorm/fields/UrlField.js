const { CharField } = require('./CharField')
const { InvalidUrl } = require('../errors')

const createUrl = str => new URL(str)

/** Field used for url values */
class UrlField extends CharField {
  validateValue (value, inst, fieldName) {
    if (value) {
      try {
        createUrl(value)
      } catch (e) {
        throw new InvalidUrl(inst, fieldName)
      }
    }
    return super.validateValue(value, inst, fieldName)
  }
}

module.exports = { UrlField }
