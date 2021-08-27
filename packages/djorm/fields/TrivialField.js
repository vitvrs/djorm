const { ValueError } = require('../errors')
const { Field } = require('../models/AttrModel')

class TrivialField extends Field {
  static choices = new Field()
  db = true
  indexable = true

  validateValue (inst, fieldName) {
    const value = inst.get(fieldName)
    if (
      typeof value !== 'undefined' &&
      this.choices &&
      !this.choices.includes(value)
    ) {
      throw new ValueError(`Invalid choice "${value}"`)
    }
    return super.validateValue(inst, fieldName)
  }
}

module.exports = { TrivialField }
