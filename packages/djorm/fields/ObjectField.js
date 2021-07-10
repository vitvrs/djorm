const { Field } = require('../models/AttrModel')
const { getModelName } = require('../models/ModelRegistry')
const { JsonField } = require('./JsonField')
const { ModelError, ValueError } = require('../errors')
const { serialize } = require('../filters')

class ObjectField extends JsonField {
  static objectClass = new Field()

  constructor (params) {
    super(params)
    if (!this.objectClass) {
      throw new ModelError(
        'Missing `objectClass` while constructing `ObjectField`'
      )
    }
  }

  parse (value, inst) {
    if (value !== null && !(value instanceof this.objectClass)) {
      if (value instanceof Object && value.constructor === Object) {
        return this.objectClass.from(value)
      }
      throw new ValueError(
        `Value must be instance of "${getModelName(
          this.objectClass
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
