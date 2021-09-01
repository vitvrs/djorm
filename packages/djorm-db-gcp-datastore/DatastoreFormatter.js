const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { ComplexQuery } = require('./ComplexQuery')
const { Count } = require('djorm/db/Count')
const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')
const { Delete } = require('djorm/db/Delete')
const { Insert } = require('djorm/db/Insert')
const { NotImplemented } = require('djorm/errors')
const { QueryFormatterError } = require('djorm/db/errors')
const { Select } = require('djorm/db/Select')
const { Update } = require('djorm/db/Update')
const { Writable } = require('stream')

class DatastoreFormatter extends DatastoreFormatterBase {
  constructor (driver) {
    super()
    this.driver = driver
    this.mapOrderBy = this.mapOrderBy.bind(this)
  }

  requireFormatter = Model => new (require(`./${Model}`)[Model])(this.driver)

  formatQuery (qs) {
    if (qs instanceof Delete) {
      return this.formatDelete(qs)
    }
    if (qs instanceof Insert) {
      return this.formatInsert(qs)
    }
    if (qs instanceof Select) {
      return this.formatSelect(qs)
    }
    if (qs instanceof Update) {
      return this.formatUpdate(qs)
    }
    throw new QueryFormatterError('Unknown query type')
  }

  formatDelete (qs) {
    return async () => {
      await this.driver.waitForConnection()
      await this.db.delete(this.mapFilter(qs, { qs }))
    }
  }

  formatInsert (qs) {
    return async () => {
      await this.driver.waitForConnection()
      const values = await this.prepareKeys(qs, this.formatValues(qs))
      await this.driver.waitForConnection()
      await this.db.upsert(values)
      const last = values[values.length - 1]
      return {
        insertId: this.getKeyValue(last)
      }
    }
  }

  formatSelect (qs) {
    return () => {
      const [query, modifiers] = this.getSelectModifiers(qs)
      const dsQuery = modifiers.reduce(
        (aggr, modifier) => modifier(qs, aggr),
        query
      )
      const count = qs.props.selection.find(item => item instanceof Count)
      // @HACK: Assume this is count query and add dummy postprocessor
      if (count) {
        const dsq = new ComplexQuery(
          async () =>
            await new Promise((resolve, reject) => {
              let total = 0
              dsQuery
                .select('__key__')
                .limit(-1)
                .offset(0)
                .runStream()
                .pipe(
                  new Writable({
                    objectMode: true,
                    write (chunk, enc, next) {
                      total += 1
                      next()
                    }
                  })
                )
                .on('finish', () => resolve([{ __djorm_cnt: total }]))
                .on('error', reject)
            })
        )
        return dsq
      }
      return dsQuery
    }
  }

  formatUpdate (qs) {
    return async () => {
      await this.driver.waitForConnection()
      const [result] = await this.db.upsert(this.formatValues(qs))
      return {
        changes: result.indexUpdates
      }
    }
  }

  async prepareKeys (qs, values) {
    const keyLess = values.filter(item => !this.getKeyValue(item))
    const partialKey = this.formatKey(qs.props.model)
    const [ids] = await this.db.allocateIds(partialKey, keyLess.length)
    return values.map(item =>
      this.getKeyValue(item)
        ? item
        : {
            ...item,
            key: ids.shift()
          }
    )
  }

  getSelectModifiers (qs) {
    const modifiers = [
      this.mapFilter,
      this.mapOrderBy,
      this.mapLimit,
      this.mapOffset
    ]
    const query = this.db.createQuery(this.db.namespace, qs.props.target)
    return [query, modifiers]
  }

  mapCondition (qs, ...args) {
    if (qs instanceof Select) {
      return this.mapSelectCondition(qs, ...args)
    }
    if (qs instanceof Delete) {
      return this.mapDeleteCondition(qs, ...args)
    }
    throw new NotImplemented(
      `Cannot properly map query conditions for "${qs.constructor.name}" query `
    )
  }

  mapDeleteCondition (qs, query, fieldName, operator, value) {
    if (operator !== ComparisonOperator.eq) {
      throw new NotImplemented(
        'Datastore db support only eq operator for deletion'
      )
    }
    if (fieldName !== query.qs.props.model.pkName) {
      throw new NotImplemented(
        `Datastore delete can filter only by primary keys, but "${fieldName}" was given`
      )
    }
    return this.formatKey(query.qs.props.model, value)
  }

  mapSelectCondition (qs, query, fieldName, operator, value) {
    if (qs.model && qs.model.pkName === fieldName) {
      return query.filter('__key__', operator, this.formatKey(qs.model, value))
    }
    return query.filter(fieldName, operator, value)
  }

  mapOrderByDirective (query, oi) {
    const [name, descending] = this.parseOrderDirective(oi)
    return query.order(name, { descending })
  }

  mapOrderBy (qs, query) {
    if (qs.props.orderBy) {
      return qs.props.orderBy.reduce(
        (q, expr) => this.mapOrderByDirective(q, expr),
        query
      )
    }
    return query
  }

  mapLimit (qs, query) {
    return qs.props.limit ? query.limit(qs.props.limit) : query
  }

  mapOffset (qs, query) {
    return qs.props.offset ? query.offset(qs.props.offset) : query
  }
}

module.exports = { DatastoreFormatter }
