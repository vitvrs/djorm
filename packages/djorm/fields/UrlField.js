const { CharField } = require('./CharField')
const { InvalidUrl } = require('../errors')

const createUrl = str => new URL(str)

/** Field used for url values */
class UrlField extends CharField {
  validateValue (inst, fieldName) {
    const value = inst.get(fieldName)
    if (value) {
      try {
        createUrl(value)
      } catch (e) {
        throw new InvalidUrl(inst, fieldName)
      }
    }
    return super.validateValue(inst, fieldName)
  }
}

module.exports = { UrlField }
