const moment = require('moment-timezone')

const { DateTimeField } = require('./DateTimeField')

/** Field used for datetime values */
class DateField extends DateTimeField {
  serialize (value) {
    if (value) {
      return moment(value)
        .utc()
        .format('YYYY-MM-DD')
    }
    return super.serialize(value)
  }
}

module.exports = { DateField }
