const { PositiveIntegerField } = require('./PositiveIntegerField')

/** Field used for non negative integer primary keys */
class AutoField extends PositiveIntegerField {
  constructor (props) {
    super({ primary: true, autoIncrement: true, ...props })
  }
}

module.exports = { AutoField }
