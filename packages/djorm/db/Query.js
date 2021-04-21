const { And } = require('./And')
const { DatabaseModelBase } = require('../models/DatabaseModelBase')
const { filterUnique } = require('../filters')
const { getModelName } = require('../models/ModelRegistry')
const { ImmutablePropModel } = require('./props')
const { parseFieldObjects } = require('../models/AttrModel')
const { Q } = require('./QueryCondition')
const { QueryColumnGroup } = require('./QueryColumnGroup')
const { QueryTable } = require('./QueryTable')

const defaultConditions = () => []

class Query extends ImmutablePropModel {
  static fromDb (db) {
    return new this({ db })
  }

  get db () {
    return this.props.db || this.model.db
  }

  get model () {
    return this.getProp('model')
  }

  mapModel (value) {
    return this.setProp('model', value)
  }

  filter (props) {
    return this.initProp('conditions', defaultConditions).appendProp(
      'conditions',
      props instanceof Q ? props : new And(props)
    )
  }

  target (value) {
    if (value.prototype && value.prototype instanceof DatabaseModelBase) {
      const [selection] = this.getModelFields(value)
      return this.setProp('target', value.table)
        .setProp('selection', selection, true)
        .setProp('model', value, true)
    }
    return this.setProp('target', value)
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

  async exec () {
    return await this.db.exec(this.db.formatQuery(this))
  }

  async query () {
    return await this.db.query(this.db.formatQuery(this))
  }

  createReadStream () {
    return this.db.stream(this.db.formatQuery(this))
  }
}

module.exports = {
  Query
}
