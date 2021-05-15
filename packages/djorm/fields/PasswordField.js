const { CharField } = require('./CharField')

/** Field used for password values */
class PasswordField extends CharField {
  static getPasswordHash (password) {
    const { getSettings } = require('../config')
    return require('crypto')
      .createHmac('sha256', getSettings().secretKey)
      .update(password)
      .digest('hex')
  }

  parse (value) {
    return value && this.constructor.getPasswordHash(value)
  }

  fromDb (value) {
    return value
  }
}

module.exports = { PasswordField }
