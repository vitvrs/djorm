const { And } = require('./And')
const { DatabaseModel } = require('../models/DatabaseModel')
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

const defaultConditions = () => []
const defaultSelection = () => []
const defaultJoins = () => []

class Select extends Query {
  // group by
  get model () {
    return this.getProp('model')
  }

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
        last.columns = last.columns.concat(fieldNames)
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
    } while (obj && obj !== DatabaseModel)
    return [selection, joins]
  }

  from (value) {
    if (value.prototype && value.prototype instanceof DatabaseModel) {
      const [selection] = this.getModelFields(value)
      return this.setProp('from', value.table).setProp('selection', selection)
    }
    return this.setProp('from', value)
  }

  distinct (fields) {
    return this.setProp('distinct', fields)
  }

  filter (props) {
    return this.initProp('conditions', defaultConditions).appendProp(
      'conditions',
      props instanceof Q ? props : new And(props)
    )
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

  // Fetch methods
  async all () {}
  async first () {}
  async last () {}
}

module.exports = {
  Select
}
