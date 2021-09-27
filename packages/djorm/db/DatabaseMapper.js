const { getModelName } = require('../models/ModelRegistry')
const { Transform } = require('stream')
const { warn } = require('../logger')

class DatabaseMapper extends Transform {
  static updateInstanceValues (inst, values) {
    const entries = Object.entries(values)
    for (const [fieldPath, fieldValue] of entries) {
      try {
        inst.consumeDbValue(fieldPath, fieldValue)
      } catch (e) {
        // Avoid killing mapper by parsing errors
        inst.consumeDbValue(fieldPath, null)
        warn(e)
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
