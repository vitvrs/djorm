const { ValueError } = require('../errors')
const { Field } = require('../models/AttrModel')

class TrivialField extends Field {
  static choices = new Field()
  db = true

  parse (value) {
    if (this.choices && !this.choices.includes(value)) {
      throw new ValueError(`Invalid choice "${value}"`)
    }
    return value
  }
}

module.exports = { TrivialField }
