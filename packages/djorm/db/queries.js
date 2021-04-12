const { And } = require('./And')
const { DatabaseModel } = require('../models/DatabaseModel')
const { filterUnique } = require('../filters')
const { getModelName } = require('../models/ModelRegistry')
const { ImmutablePropModel } = require('./props')
const { parseFieldObjects } = require('../models/AttrModel')
const { PropModel } = require('./props')
const { Q } = require('./QueryCondition')

const defaultConditions = () => []
const defaultSelection = () => []
const defaultJoins = () => []

const QuerySetMode = {
  delete: 'DELETE',
  select: 'SELECT',
  update: 'UPDATE'
}

const parseColumn = col => {
  if (typeof col === 'string') {
    if (col.includes('__')) {
      const [source, name] = col.split('__')
      return { source, name }
    }
  }
  return col
}

class QueryIdentifier extends PropModel {
  get name () {
    return this.props.name
  }

  get alias () {
    return this.props.alias
  }

  get prefix () {
    return this.props.prefix
  }
}

class QueryColumn extends QueryIdentifier {
  get source () {
    return this.props.source
  }
}

class QueryTable extends QueryIdentifier {}

class QueryJoin extends QueryIdentifier {
  static left = 'LEFT'
  static right = 'RIGHT'
  static inner = 'INNER'

  get side () {
    return this.props.side || this.constructor.inner
  }
}

class QueryForeignKey extends QueryIdentifier {
  constructor (column1, column2) {
    super({
      leftColumn: parseColumn(column1),
      rightColumn: parseColumn(column2)
    })
  }

  get leftColumn () {
    return this.props.leftColumn
  }

  get rightColumn () {
    return this.props.rightColumn
  }
}

class QueryShortcut extends PropModel {}

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

class Query extends ImmutablePropModel {
  // group by
  get model () {
    return this.getProp('model')
  }

  get mode () {
    return this.getProp('mode', QuerySetMode.select)
  }

  select (...value) {
    return this.initProp('selection', defaultSelection)
      .appendProp('selection', ...value)
      .setProp('mode', QuerySetMode.select, true)
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
    let nextInstance
    if (value.prototype && value.prototype instanceof DatabaseModel) {
      const [selection] = this.getModelFields(value)
      nextInstance = this.setProp('from', value.table).setProp(
        'selection',
        selection
      )
    } else {
      nextInstance = this.setProp('from', value)
    }

    return nextInstance.setProp('mode', QuerySetMode.select, true)
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

  join (table, alias, conditions) {
    this.initProp('joins', defaultJoins)
    if (table instanceof QueryJoin) {
      return this.appendProp('joins', table)
    }
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
  QueryColumn,
  QueryColumnGroup,
  QueryForeignKey,
  QueryIdentifier,
  QueryJoin,
  Query,
  QuerySetMode,
  QueryShortcut,
  QueryTable
}
