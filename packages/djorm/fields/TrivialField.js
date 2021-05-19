const { FieldValidationError } = require('../errors')
const { Field } = require('../models/AttrModel')

class TrivialField extends Field {
  static choices = new Field()
  static unique = new Field({ default: false })
  static primary = new Field({ default: false })
  static null = new Field({ default: false })
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
