const { Field } = require('../models/AttrModel')
const { getModelName } = require('../models/ModelRegistry')
const { ValueError } = require('../errors')
const { QueryArray } = require('../db/QueryArray')

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
      `Value passed to ${getModelName(
        this.constructor
      )} must be an Array, but ${typeof value} "${value}" was given`
    )
  }

  fromDb (value, inst) {
    return this.parse(value, inst)
  }

  toDb (value) {
    return value ? new QueryArray(value) : null
  }

  async validateValue (value, inst, fieldName) {
    if (value) {
      for (const item of value) {
        await this.baseField.validateValue(item, inst, fieldName)
      }
    }
    await super.validateValue(value, inst, fieldName)
  }
}

module.exports = { ArrayField }
