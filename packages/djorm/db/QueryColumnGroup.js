const { QueryColumn } = require('./QueryColumn')
const { QueryShortcut } = require('./QueryShortcut')

class QueryColumnGroup extends QueryShortcut {
  get source () {
    return this.props.source
  }

  get prefix () {
    return this.props.prefix
  }

  get columns () {
    return this.props.columns
  }

  breakdown () {
    return this.columns.map(
      name =>
        new QueryColumn({
          name,
          source: this.source,
          prefix: this.prefix
        })
    )
  }
}

module.exports = { QueryColumnGroup }
