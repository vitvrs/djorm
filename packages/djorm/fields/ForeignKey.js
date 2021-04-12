const camelCase = require('camelcase')

const { Field } = require('../models/AttrModel')
const { getModel, getModelName } = require('../models/ModelRegistry')
const { PositiveIntegerField } = require('./PositiveIntegerField')
const { ValueError } = require('../errors')

/** Field used for foreign key objects */
class ForeignKey extends Field {
  static model = new Field()
  static keyField = new Field()
  static keyFieldType = new Field()

  constructor (params) {
    super(params)
    const KeyFieldType = this.getValue('keyFieldType') || PositiveIntegerField
    if (!this.keyField) {
      this.keyField = `${camelCase(this.getValue('model'))}Id`
    }
    this.foreignKeyField = new KeyFieldType()
    this.expandedField = {
      [this.keyField]: this.foreignKeyField
    }
  }

  expand () {
    return this.expandedField
  }

  parse (value) {
    const Model = getModel(this.model)
    if (value && !(value instanceof Model)) {
      if (typeof value === 'object') {
        return new Model(value)
      }
      throw new ValueError(
        `Value must be instance of "${getModelName(
          Model
        )}" or null, but "${value}" was given`
      )
    }
    return value
  }

  async fetch (inst) {
    const model = getModel(this.model)
    return await model.objects.requireOne({
      [model.pkName]: inst.getValue(this.keyField)
    })
  }
}

module.exports = { ForeignKey }
