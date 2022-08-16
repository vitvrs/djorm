const { CharField } = require('./CharField')
const { FieldValidationError } = require('../errors')

class InvalidEmail extends FieldValidationError {
  constructor (obj, propertyName) {
    super(
      obj,
      propertyName,
      `Invalid e-mail address: "${obj[propertyName]}" for "${propertyName}"`
    )
  }
}

class EmailField extends CharField {
  validateValue (value, inst, fieldName) {
    if (value) {
      const re = /\S+@\S+\.\S+/
      if (!re.test(value)) {
        throw new InvalidEmail(inst, fieldName)
      }
    }
    return super.validateValue(value, inst, fieldName)
  }
}

module.exports = { InvalidEmail, EmailField }
