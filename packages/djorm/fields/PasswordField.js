const { CharField } = require('./CharField')

/** Field used for password values */
class PasswordField extends CharField {
  get secretKey () {
    return require('../config').getSettings('secretKey')
  }

  getPasswordHash (password) {
    return require('crypto')
      .createHmac('sha256', this.secretKey)
      .update(password)
      .digest('hex')
  }

  parse (value) {
    return value && this.getPasswordHash(value)
  }

  fromDb (value) {
    return value
  }
}

module.exports = { PasswordField }
