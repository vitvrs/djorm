const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreSelectFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return () => {
      const [query, modifiers] = this.createModifiers(qs)
      return modifiers.reduce((aggr, modifier) => modifier(qs, aggr), query)
    }
  }

  createModifiers (qs) {
    const modifiers = [
      this.mapFilter,
      this.mapOrderBy,
      this.mapLimit,
      this.mapOffset
    ]
    const query = this.db.createQuery(this.db.namespace, qs.props.target)
    return [query, modifiers]
  }

  mapCondition = (qs, query, fieldName, operator, value) => {
    if (qs.model && qs.model.pkName === fieldName) {
      return query.filter('__key__', operator, this.formatKey(qs.model, value))
    }
    return query.filter(fieldName, operator, value)
  }

  mapOrderByDirective = (query, oi) => {
    const [name, descending] = this.parseOrderDirective(oi)
    return query.order(name, { descending })
  }

  mapOrderBy = (qs, query) => {
    if (qs.props.orderBy) {
      return qs.props.orderBy.reduce(
        (q, expr) => this.mapOrderByDirective(q, expr),
        query
      )
    }
    return query
  }

  mapLimit = (qs, query) => {
    return qs.props.limit ? query.limit(qs.props.limit) : query
  }

  mapOffset = (qs, query) => {
    return qs.props.offset ? query.offset(qs.props.offset) : query
  }
}

module.exports = { DatastoreSelectFormatter }
