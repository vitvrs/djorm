const { FieldValidationError } = require('../errors')
const { Field } = require('../models/AttrModel')

class TrivialField extends Field {
  static choices = new Field()
  db = true
  indexable = true

  validateValue (value, inst, fieldName) {
    if (
      (typeof value !== 'undefined' || (!this.null && value === null)) &&
      this.choices &&
      !this.choices.includes(value)
    ) {
      throw new FieldValidationError(
        inst,
        fieldName,
        `Invalid choice "${value}"`
      )
    }
    return super.validateValue(value, inst, fieldName)
  }
}

module.exports = { TrivialField }
