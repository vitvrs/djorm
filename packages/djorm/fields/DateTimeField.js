const moment = require('moment-timezone')

const { TrivialField } = require('./TrivialField')

/** Field used for datetime values */
class DateTimeField extends TrivialField {
  parse (value) {
    if (typeof value === 'string') {
      return super.parse(moment(value).toDate())
    }
    return super.parse(value)
  }
}

module.exports = { DateTimeField }
