const { CharField } = require('./CharField')

/** Field used for password values */
class PasswordField extends CharField {
  getPasswordHash (password) {
    const { getSettings } = require('../config')
    return require('crypto')
      .createHmac('sha256', getSettings().secretKey)
      .update(password)
      .digest('hex')
  }
}

module.exports = { PasswordField }
