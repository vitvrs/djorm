const { TrivialField } = require('./TrivialField')
const { Field } = require('../models/AttrModel')

/** Field used for char values */
class TextField extends TrivialField {
  static encrypted = new Field({ default: false })
  algorithm = 'aes256'

  getSecretKey () {
    return require('../config').getSettings().secretKey
  }

  getSecretKeyDigest () {
    return require('crypto')
      .createHash('sha256')
      .update(this.getSecretKey())
      .digest()
  }

  encryptValue (value) {
    const iv = Buffer.from(this.getSecretKey().substring(0, 16))
    const cipher = require('crypto').createCipheriv(
      this.algorithm,
      this.getSecretKeyDigest(),
      iv
    )
    const msg = Buffer.concat([cipher.update(value), cipher.final()])
    return `${this.algorithm}:${iv.toString('hex')}:${msg.toString('hex')}`
  }

  decryptValue (value) {
    const [algorithm, ivKey, cipher] = value.split(':')
    const decipher = require('crypto').createDecipheriv(
      algorithm,
      this.getSecretKeyDigest(),
      Buffer.from(ivKey, 'hex')
    )
    return [decipher.update(cipher, 'hex'), decipher.final()].join('')
  }

  serialize (value) {
    if (!this.encrypted || !value) {
      return value
    }
    return this.encryptValue(value)
  }

  fromDb (value) {
    if (!this.encrypted || !value) {
      return value
    }
    return this.decryptValue(value)
  }
}

module.exports = { TextField }
