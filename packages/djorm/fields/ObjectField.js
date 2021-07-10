const { Field } = require('../models/AttrModel')
const { getModel, getModelName } = require('../models/ModelRegistry')
const { JsonField } = require('./JsonField')
const { ModelError, ValueError } = require('../errors')
const { serialize } = require('../filters')

class ObjectField extends JsonField {
  static model = new Field()

  constructor (params) {
    super(params)
    if (!this.model) {
      throw new ModelError(
        'You must provide `model` to construct `ObjectField`'
      )
    }
  }

  resolveObjectClass () {
    if (typeof this.model === 'string') {
      this.model = getModel(this.model)
    }
  }

  parse (value, inst) {
    this.resolveObjectClass()
    if (value !== null && !(value instanceof this.model)) {
      if (value instanceof Object && value.constructor === Object) {
        return this.model.from(value)
      }
      throw new ValueError(
        `Value must be instance of "${getModelName(
          this.model
        )}" but "${value}" was given`
      )
    }
    return super.parse(value, inst)
  }

  serialize (value) {
    return super.serialize(serialize(value))
  }

  toDb (value) {
    return super.toDb(serialize(value))
  }
}

module.exports = { ObjectField }
