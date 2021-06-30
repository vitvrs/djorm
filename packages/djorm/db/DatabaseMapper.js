const { getModelName } = require('../models/ModelRegistry')
const { Transform } = require('stream')

class DatabaseMapper extends Transform {
  static parseFieldName (fieldName, prefix) {
    if (fieldName.startsWith(prefix)) {
      return fieldName.substr(prefix.length)
    } else if (!fieldName.includes('__')) {
      return fieldName
    }
    return null
  }

  static updateInstanceValues (inst, values, prefix) {
    const entries = Object.entries(values)
    for (const [fieldName, fieldValue] of entries) {
      const fieldNameStripped = this.parseFieldName(fieldName, prefix)
      if (fieldNameStripped) {
        try {
          inst.setFromDb(fieldNameStripped, fieldValue)
        } catch (e) {
          // Avoid killing mapper by parsing errors
          inst.set(fieldNameStripped, null)
          // @TODO: Warn about this error!
        }
      }
    }
  }

  static mapInstanceValues (Model, values, prefix) {
    const inst = new Model()
    this.updateInstanceValues(inst, values, prefix)
    return inst
  }

  static createMapper = Model => {
    if (!Model) {
      return null
    }
    const prefix = `${getModelName(Model)}__`
    return values => this.mapInstanceValues(Model, values, prefix)
  }

  constructor (qs) {
    super({ readableObjectMode: true, writableObjectMode: true })
    this.map = this.constructor.createMapper(qs.model)
  }

  _transform (item, enc, next) {
    this.push(this.map ? this.map(item) : item)
    next()
  }
}

module.exports = {
  DatabaseMapper
}
