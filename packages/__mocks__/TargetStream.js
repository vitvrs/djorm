const { Writable } = require('stream')

class TargetStream extends Writable {
  data = []
  constructor () {
    super({ objectMode: true })
  }

  _write (item, enc, next) {
    this.data.push(item)
    next()
  }
}

module.exports = { TargetStream }
