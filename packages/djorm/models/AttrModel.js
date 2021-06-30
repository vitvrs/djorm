const { FieldError, UnknownField } = require('../errors')
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
    const fields = Model.fields
    const values = Object.entries(value)
      .map(([fieldName, value]) => ({
        [fieldName]: fields[fieldName].fromDb(value)
      }))
      .reduce((aggr, chunk) => Object.assign(aggr, chunk), {})
    return new Model(values)
  }

  static get fields () {
    return this.fieldObjects
      .map(([key, value]) => ({ [key]: value }))
      .reduce((aggr, chunk) => Object.assign(aggr, chunk), {})
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
    if (fieldAttrs && fieldAttrs[1] instanceof FieldModel) {
      return fieldAttrs[1]
    }
    throw new UnknownField(
      `Unknown field "${fieldName}" for model "${getModelName(this)}"`
    )
  }

  static register () {
    return registerModel(this)
  }

  get (fieldName) {
    const value = this[fieldName]
    if (value === undefined) {
      const field = this.constructor.getField(fieldName)
      const defaultValue = field.getDefault(this)
      if (defaultValue !== undefined) {
        this.set(fieldName, defaultValue)
      }
      return defaultValue
    }
    return value
  }

  set (fieldName, value) {
    const field = this.constructor.getField(fieldName)
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
      this.set(key, value)
    }
    return this
  }

  toJson (includePrivate = false) {
    return this.constructor.fieldObjects.reduce((aggr, [key, field]) => {
      if (field.private && !includePrivate) {
        return aggr
      }
      const value = field.serialize(this.get(key))
      if (typeof value !== 'undefined') {
        aggr[key] = value
      }
      return aggr
    }, {})
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
  /** Break down complex field into additional field instances. This enables
   *  complex fields, like ForeignKey - as it is composed of the non-db field
   *  and the database foreign key value field.
   */
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

  /** Based on Robustness principle, fields will accept various representations
   *  of the actual value and try to parse it into a strict model value
   *  representation or fail
   */
  parse (value) {
    return value
  }

  /** Convert database representation of the value into the instance
   *  representation of the value
   */
  fromDb (value) {
    return this.parse(value)
  }

  /** Serialize value in a way that would be represented in the database */
  toDb (value) {
    return this.serialize(value)
  }

  /** Serialize model value representation into JSON */
  serialize (value) {
    return value
  }

  hasDefault () {
    return this.default !== undefined
  }

  /** Get default value for this field based on the current instance
   * @param {AttrModel} inst
   * @returns {any}
   */
  getDefault (inst) {
    if (this.default instanceof Function) {
      return this.default(inst)
    }
    return this.default
  }

  /** Given this field has a validator, try to run it as a callback. Callback
   *  will receive field value, the model instance, and field name as
   *  arguments.
   */
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
