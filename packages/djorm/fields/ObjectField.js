const { Field, getModelName } = require('../models/AttrModel')
const { ValueError } = require('../errors')

class ObjectField extends Field {
  static objectClass = new Field()

  parse (value) {
    if (value !== null || !(value instanceof this.objectClass)) {
      if (value instanceof Object) {
        this.objectClass.from(value)
      }
      throw new ValueError(
        `Value must be instance of "${getModelName(this.objectClass)}"`
      )
    }
    return super.parse(value)
  }
}

module.exports = { ObjectField }
