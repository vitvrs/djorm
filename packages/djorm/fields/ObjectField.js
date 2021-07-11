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
    const preparsed = super.parse(value, inst)
    if (preparsed !== null && !(preparsed instanceof this.model)) {
      if (preparsed instanceof Object && preparsed.constructor === Object) {
        return this.model.from(preparsed)
      }
      throw new ValueError(
        `Value must be instance of "${getModelName(
          this.model
        )}" but "${preparsed}" was given`
      )
    }
    return preparsed
  }

  serialize (value) {
    return super.serialize(serialize(value))
  }

  toDb (value) {
    return super.toDb(serialize(value))
  }
}

module.exports = { ObjectField }
