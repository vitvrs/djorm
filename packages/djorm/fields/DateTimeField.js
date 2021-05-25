const moment = require('moment-timezone')

const { TrivialField } = require('./TrivialField')
const { ValueError } = require('../errors')

/** Field used for datetime values */
class DateTimeField extends TrivialField {
  parse (value) {
    if (!value) {
      return value
    }
    if (value instanceof Date) {
      return value
    }
    const parsed = moment(value)
    if (!parsed.isValid()) {
      throw new ValueError(`Value "${value}" is not a valid Date/Time`)
    }
    return parsed.toDate()
  }

  toDb (value) {
    return value
  }

  serialize (value) {
    return moment(value).toISOString()
  }
}

module.exports = { DateTimeField }
