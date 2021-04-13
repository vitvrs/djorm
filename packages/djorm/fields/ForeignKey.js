const camelCase = require('camelcase')

const { Field } = require('../models/AttrModel')
const { getModel, getModelName } = require('../models/ModelRegistry')
const { PositiveIntegerField } = require('./PositiveIntegerField')
const { Relation } = require('./Relation')
const { ValueError } = require('../errors')

/** Field used for foreign key objects */
class ForeignKey extends Relation {
  static keyField = new Field()
  static keyFieldType = new Field()
  static model = new Field()
  static parentModel = new Field()
  static relatedName = new Field()

  constructor (params) {
    super(params)
    const KeyFieldType = this.get('keyFieldType') || PositiveIntegerField
    if (!this.keyField) {
      this.keyField = `${camelCase(this.get('model'))}Id`
    }
    this.foreignKeyField = new KeyFieldType()
    this.expandedField = {
      [this.keyField]: this.foreignKeyField
    }
  }

  getDefault (inst) {
    return this.queryTargetModel(inst)
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

  queryParentModel (primaryInstance) {
    return getModel(this.parentModel).objects.filter({
      [this.keyField]: primaryInstance.pk
    })
  }

  queryTargetModel (fkInstance) {
    const Model = getModel(this.model)
    return Model.objects.filter({
      [Model.pkName]: fkInstance.get(this.keyField)
    })
  }

  async fetch (inst) {
    const model = getModel(this.model)
    return await model.objects.requireOne({
      [model.pkName]: inst.get(this.keyField)
    })
  }
}

module.exports = { ForeignKey }
