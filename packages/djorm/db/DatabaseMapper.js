const { getModelName } = require('../models/ModelRegistry')
const { Transform } = require('stream')

class DatabaseMapper extends Transform {
  static createMapper = Model => {
    if (!Model) {
      return null
    }
    const prefix = `${getModelName(Model)}__`
    const prefixLength = prefix.length
    return item =>
      new Model(
        Object.entries(item).reduce((aggr, [fieldName, fieldValue]) => {
          if (fieldName.startsWith(prefix)) {
            aggr[fieldName.substr(prefixLength)] = fieldValue
          } else if (!fieldName.includes('__')) {
            aggr[fieldName] = fieldValue
          }
          return aggr
        }, {})
      )
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
