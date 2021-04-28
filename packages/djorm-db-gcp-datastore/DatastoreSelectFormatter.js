const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreSelectFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return () =>
      [this.mapFilter, this.mapOrderBy, this.mapLimit, this.mapOffset].reduce(
        (aggr, modifier) => modifier(qs, aggr),
        this.db.createQuery(this.db.namespace, qs.props.target)
      )
  }

  mapCondition = (query, fieldName, operator, value) =>
    query.filter(fieldName, operator, value)

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
