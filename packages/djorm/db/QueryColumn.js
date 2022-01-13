const { QueryIdentifier } = require('./QueryIdentifier')

class QueryColumn extends QueryIdentifier {
  static IdentifierSeparator = '__'

  static parseSpec (colSpec) {
    if (colSpec instanceof this) {
      return colSpec
    } else if (typeof colSpec === 'string') {
      const [name, ...source] = colSpec
        .split(this.IdentifierSeparator)
        .reverse()
      const alias = source.length ? colSpec : null
      return {
        alias,
        source: source.reverse().join(this.IdentifierSeparator),
        name
      }
    }
    return new this(colSpec)
  }

  constructor (props) {
    super(typeof props === 'string' ? QueryColumn.parseSpec(props) : props)
  }

  get source () {
    return this.props.source
  }
}

module.exports = { QueryColumn }
