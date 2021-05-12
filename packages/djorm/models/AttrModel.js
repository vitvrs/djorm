const { FieldError } = require('../errors')
const { concatValidators, filterUnique } = require('../filters')
const { getModelName, registerModel } = require('./ModelRegistry')

let FieldModel = null

function parseFieldObjects (constructor) {
  return Object.entries(constructor)
    .filter(([key, value]) => value && value instanceof FieldModel)
    .reduce(
      (aggr, fieldTuple) => [
        ...aggr,
        fieldTuple,
        ...Object.entries(fieldTuple[1].expand())
      ],
      []
    )
}

class AttrModel {
  /**
   * @param {object} params
   */
  constructor (params = {}) {
    this.setValues(params)
  }

  static from (value) {
    if (!value) {
      return null
    }
    const Model = this
    if (value instanceof Model) {
      return value
    }
    return new Model(value)
  }

  static get fields () {
    return this.fieldObjects.reduce(
      (aggr, [key, value]) => ({ ...aggr, [key]: value }),
      {}
    )
  }

  static get fieldObjects () {
    const cached = Object.getOwnPropertyDescriptor(this, 'fieldObjectsCached')
    if (cached && cached.value) {
      return cached.value
    }
    let props = []
    let obj = this
    do {
      props = props.concat(parseFieldObjects(obj))
      obj = Object.getPrototypeOf(obj)
    } while (obj && obj !== Function)
    if (props.length) {
      Object.defineProperty(this, 'fieldObjectsCached', {
        value: props,
        enumerable: false
      })
    }
    return props
  }

  static get fieldNames () {
    return this.fieldObjects.map(([key, value]) => key)
  }

  static get selection () {
    return this.fieldObjects
      .filter(([key, value]) => value.db && !value.secret)
      .map(([key, value]) => key)
      .filter(filterUnique)
  }

  static getField (fieldName) {
    const fieldAttrs = this.fieldObjects.find(
      ([name, field]) => name === fieldName
    )
    if (!fieldAttrs) {
      return null
    }
    const [, field] = fieldAttrs
    return field
  }

  static register () {
    return registerModel(this)
  }

  get (fieldName) {
    const value = this[fieldName]
    if (value === undefined) {
      const field = this.constructor.getField(fieldName)
      return field.getDefault(this)
    }
    return value
  }

  set (fieldName, value) {
    return this.setValue(fieldName, value)
  }

  setValue (fieldName, value) {
    const field = this.constructor.fields[fieldName]
    if (!(field instanceof FieldModel)) {
      throw new Error(
        `Unknown key "${fieldName}" for model "${getModelName(
          this.constructor
        )}"`
      )
    }
    try {
      this[fieldName] = field.parse(value, this)
    } catch (e) {
      if (e instanceof FieldError) {
        e.message = `${e.message} when processing value for ${getModelName(
          this.constructor
        )}.${fieldName}`
      }
      throw e
    }
    return this
  }

  setValues (params = {}) {
    const entries = Object.entries(params)
    for (const [key, value] of entries) {
      this.setValue(key, value)
    }
    return this
  }

  serializeValues () {
    return this.constructor.fieldObjects
      .filter(([key, field]) => !field.private)
      .reduce(
        (aggr, [key, field]) => ({
          ...aggr,
          [key]: this.get(key)
        }),
        {}
      )
  }

  async validate () {
    const validator = concatValidators(
      ...this.constructor.fieldObjects.map(
        ([fieldName, field]) => async inst => {
          return await field.validateValue(inst, fieldName)
        }
      )
    )
    await validator(this)
  }
}

/** Generic Field */
class GenericField extends AttrModel {
  expand () {
    return {}
  }
}

FieldModel = GenericField

class Field extends GenericField {
  static default = new Field()
  static private = new Field({ default: false })
  static secret = new Field()
  static validator = new Field()

  parse (value) {
    return value
  }

  hasDefault () {
    return this.default !== undefined
  }

  getDefault (inst) {
    if (this.default instanceof Function) {
      return this.default(inst)
    }
    return this.default
  }

  async validateValue (inst, fieldName) {
    return this.validator
      ? await this.validator(inst.get(fieldName), inst, fieldName)
      : null
  }
}

module.exports = {
  AttrModel,
  Field,
  filterUnique,
  parseFieldObjects
}
