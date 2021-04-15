const { And } = require('./And')
const { getModelName } = require('../models/ModelRegistry')
const { Q } = require('./QueryCondition')
const { QueryColumn } = require('./QueryColumn')
const { QueryIdentifier } = require('./QueryIdentifier')
const { QueryJoin } = require('./QueryJoin')
const { Query } = require('./Query')
const { Transform } = require('stream')

const defaultSelection = () => []
const defaultJoins = () => []

class QueryMapper extends Transform {
  static createMapper = Model => {
    if (!Model) {
      return null
    }
    const prefix = `${getModelName(Model)}__`
    const prefixLength = prefix.length
    return item =>
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
  }

  constructor (qs) {
    super({ readableObjectMode: true, writableObjectMode: true })
    this.map = this.constructor.createMapper(qs.model)
  }

  _transform (item, enc, next) {
    this.push(this.map ? this.map(item) : item)
    next()
  }
}

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

  mapResults (results) {
    const mapper = QueryMapper.createMapper(this.model)
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

  async last () {
    const items = await this.fetch()
    return items[items.length - 1] || null
  }

  getMapper () {
    return new QueryMapper(this)
  }

  createReadStream (query) {
    return super.createReadStream(query).pipe(this.getMapper())
  }
}

module.exports = {
  Select
}
