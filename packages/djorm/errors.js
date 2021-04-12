function formatObject (obj) {
  return JSON.stringify(obj, null, 2)
}

function serializeError (e) {
  return e.message
}

class DjormError extends Error {}
class ConfigError extends DjormError {}
class ModelError extends DjormError {}

class FieldError extends ModelError {}
class NotConnected extends ModelError {}
class ValueError extends FieldError {}

class ValidationError extends ValueError {
  code = 'validation-error'

  serialize () {
    return {
      code: this.code,
      message: this.message
    }
  }
}

class FieldValidationError extends ValidationError {
  code = 'property-error'

  constructor (obj, propertyName, message) {
    super(
      message || `Property ${propertyName} is invalid in ${formatObject(obj)}`
    )
    this.propertyName = propertyName
    this.value = obj[propertyName]
  }

  serialize () {
    return {
      ...super.serialize(),
      field: this.propertyName,
      value: this.value
    }
  }
}

class InvalidUrl extends FieldValidationError {
  constructor (obj, propertyName) {
    super(
      obj,
      propertyName,
      `Invalid URL: "${obj[propertyName]}" for "${propertyName}"`
    )
  }
}

class NestedValidationError extends ValueError {
  fieldErrors = []

  constructor (fieldErrors) {
    super('Invalid request')
    this.fieldErrors = fieldErrors.filter(e => e instanceof FieldError)
    this.processingError = fieldErrors.find(e => !(e instanceof FieldError))
  }

  serialize () {
    return {
      message: 'validation-error',
      processingError: this.processingError
        ? serializeError(this.processingError)
        : null,
      fieldErrors: this.serializeFieldErrors()
    }
  }

  serializeFieldErrors () {
    return this.fieldErrors.map(err => err.serialize())
  }
}

class ObjectNotFound extends ModelError {
  code = 'not-found'
  status = 404
}

module.exports = {
  ConfigError,
  DjormError,
  FieldError,
  FieldValidationError,
  InvalidUrl,
  ModelError,
  NestedValidationError,
  NotConnected,
  ObjectNotFound,
  serializeError,
  ValidationError,
  ValueError
}
