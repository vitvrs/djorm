const { And } = require('./And')
const { DatabaseModelBase } = require('../models/DatabaseModelBase')
const { filterUnique } = require('../filters')
const { getModelName } = require('../models/ModelRegistry')
const { parseFieldObjects } = require('../models/AttrModel')
const { Q } = require('./QueryCondition')
const { QueryColumnGroup } = require('./QueryColumnGroup')
const { QueryColumn } = require('./QueryColumn')
const { QueryIdentifier } = require('./QueryIdentifier')
const { QueryJoin } = require('./QueryJoin')
const { Query } = require('./Query')
const { QueryTable } = require('./QueryTable')

const defaultSelection = () => []
const defaultJoins = () => []

class Select extends Query {
  // TODO: Group By

  parseSelectionValue (value) {
    if (typeof value instanceof QueryIdentifier) {
      return value
    }
    if (typeof value === 'string') {
      return new QueryColumn(value)
    }
  }

  select (...values) {
    return this.initProp('selection', defaultSelection).appendProp(
      'selection',
      ...values.map(this.parseSelectionValue)
    )
  }

  getModelFields (model) {
    const selection = []
    const joins = []
    let obj = model
    do {
      const fields = parseFieldObjects(obj).filter(([key, field]) => field.db)
      const fieldNames = fields.map(([key]) => key).filter(filterUnique)
      const last = selection[selection.length - 1]
      if (obj.meta && obj.meta.abstract && last) {
        for (const f of fieldNames) {
          last.columns.push(f)
        }
      } else {
        if (obj !== model) {
          joins.push(
            new QueryTable({
              name: obj.table,
              alias: obj.table,
              on: [
                {
                  left: { source: obj.table, name: obj.pkName },
                  column: {
                    source: model.table,
                    name: model.pkName
                  }
                }
              ]
            })
          )
        }
        selection.push(
          new QueryColumnGroup({
            source: obj.table,
            columns: fieldNames,
            prefix: getModelName(obj)
          })
        )
      }
      obj = Object.getPrototypeOf(obj)
    } while (obj && Object.getPrototypeOf(obj) !== DatabaseModelBase)
    return [selection, joins]
  }

  from (value) {
    return this.target(value)
  }

  distinct (fields) {
    return this.setProp('distinct', fields)
  }

  exclude (props) {
    const value = props instanceof Q ? props : new And(props)
    return this.filter(value.negate(true))
  }

  join (joinSpec) {
    return this.initProp('joins', defaultJoins).appendProp(
      'joins',
      joinSpec instanceof QueryJoin ? joinSpec : new QueryJoin(joinSpec)
    )
  }

  orderBy (...fields) {
    return this.setProp('orderBy', fields)
  }

  limit (value) {
    return this.setProp('limit', value)
  }

  offset (value) {
    return this.setProp('offset', value)
  }

  async fetchResults () {
    return await this.db.query(this.db.formatQuery(this))
  }

  mapResults (results) {
    const Model = this.model
    if (!Model) {
      return results
    }
    const prefix = `${getModelName(Model)}__`
    const prefixLength = prefix.length
    return results.map(
      item =>
        new Model(
          Object.entries(item)
            .filter(([fieldValue]) => fieldValue.startsWith(prefix))
            .reduce(
              (aggr, [fieldName, fieldValue]) => ({
                ...aggr,
                [fieldName.substr(prefixLength)]: fieldValue
              }),
              {}
            )
        )
    )
  }

  async fetch () {
    return this.mapResults(await this.fetchResults())
  }

  async all () {
    return await this.fetch()
  }

  async first () {
    const items = await this.limit(1).fetch()
    return items[0]
  }

  async last () {
    const items = await this.fetch()
    return items[items.length - 1]
  }
}

module.exports = {
  Select
}
