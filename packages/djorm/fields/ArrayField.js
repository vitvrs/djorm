const { Field } = require('../models/AttrModel')
const { getModelName } = require('../models/ModelRegistry')
const { ValueError } = require('../errors')

class ArrayField extends Field {
  static baseField = new Field()
  static maxLength = new Field()

  db = true
  indexable = false

  parse (value, inst) {
    if (value instanceof Array) {
      return value.map(item => this.baseField.parse(item, inst))
    }
    if (value === null) {
      return super.parse(value, inst)
    }
    throw new ValueError(
      `Value passed to ${getModelName(this.constructor)} must be an Array.`
    )
  }

  fromDb (value, inst) {
    return this.parse(value, inst)
  }

  async validateValue (inst, fieldName) {
    await super.validateValue(inst, fieldName)
  }
}

module.exports = { ArrayField }
