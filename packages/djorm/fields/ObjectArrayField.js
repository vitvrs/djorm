const { getModelName } = require('../models/ModelRegistry')
const { ObjectField } = require('./ObjectField')
const { ValueError } = require('../errors')

class ObjectArrayField extends ObjectField {
  parse (value) {
    if (value) {
      if (!(value instanceof Array)) {
        throw new ValueError(
          `Value must be an array of "${getModelName(
            this.objectClass
          )}", but "${value}" was given.`
        )
      }

      return value.map(item => super.parse(item))
    }
    return super.parse(value)
  }
}

module.exports = { ObjectArrayField }
