const { And } = require('./And')
const { Count } = require('./Count')
const { getModelName } = require('../models/ModelRegistry')
const { ObjectNotFound } = require('../errors')
const { Q } = require('./QueryCondition')
const { QueryAllRecords } = require('./QueryAllRecords')
const { QueryColumn } = require('./QueryColumn')
const { QueryIdentifier } = require('./QueryIdentifier')
const { QueryJoin } = require('./QueryJoin')
const { Query } = require('./Query')
const { QueryShortcut } = require('./QueryShortcut')
const { UnknownType } = require('./errors')

const defaultSelection = () => []
const defaultJoins = () => []

class Select extends Query {
  // TODO: Group By

  parseSelectionValue (value) {
    if (value instanceof QueryIdentifier || value instanceof QueryShortcut) {
      return value
    }
    if (typeof value === 'string') {
      return new QueryColumn(value)
    }
    throw new UnknownType(`Value "${value}" is not a valid selection type`)
  }

  select (...values) {
    return this.initProp('selection', defaultSelection).appendProp(
      'selection',
      ...values.map(this.parseSelectionValue)
    )
  }

  from (value) {
    return this.target(value)
  }

  distinct (fields = []) {
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

  mapResults (results) {
    const mapper = this.db.Mapper.createMapper(this.model)
    return mapper ? results.map(mapper) : results
  }

  async fetch () {
    return this.mapResults(await this.query())
  }

  async all () {
    return await this.fetch()
  }

  async first () {
    const items = await this.limit(1).fetch()
    return items[0] || null
  }

  async get () {
    const obj = await this.first()
    if (!obj) {
      throw new ObjectNotFound(
        this.model
          ? `Could not find specified "${getModelName(this.model)}"`
          : 'Query did not return a result'
      )
    }
    return obj
  }

  async last () {
    const items = await this.fetch()
    return items[items.length - 1] || null
  }

  async count () {
    const result = await this.setProp('selection', [
      new Count({
        args: [new QueryAllRecords()],
        alias: '__djorm_cnt'
      })
    ])
      .mapModel(null)
      .first()
    return result.__djorm_cnt
  }

  getMapper () {
    return new this.db.Mapper(this)
  }

  stream () {
    return super.stream().pipe(this.getMapper())
  }
}

module.exports = {
  Select
}
