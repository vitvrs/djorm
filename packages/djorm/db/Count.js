const { QueryFunc } = require('./QueryFunc')

class Count extends QueryFunc {
  constructor (props) {
    super({ ...props, name: 'COUNT' })
  }
}

module.exports = { Count }
