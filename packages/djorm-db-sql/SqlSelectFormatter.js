const { QueryColumn } = require('djorm/db/QueryColumn')
const { QueryFormatterError } = require('djorm/db/errors')
const { QueryIdentifier } = require('djorm/db/QueryIdentifier')
const { QueryShortcut } = require('djorm/db/QueryShortcut')
const { SqlFormatterBase } = require('./SqlFormatterBase')

class SqlSelectFormatter extends SqlFormatterBase {
  formatQuery (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatSelection(qs),
      this.formatFrom(qs),
      this.formatJoin(qs),
      this.formatWhere(qs),
      /*
      formatGroupBySql(query),
      */
      this.formatOrderBy(qs),
      this.formatLimit(qs),
      this.formatOffset(qs)
    )
  }

  formatHeader (qs) {
    return 'SELECT'
  }

  formatAlias (statement, alias) {
    return `${statement} AS ${this.formatSafeName(alias)}`
  }

  formatIdentifier (identifier) {
    if (identifier instanceof QueryIdentifier) {
      const name = this.formatSafeName(identifier.name)
      return identifier.alias ? this.formatAlias(name, identifier.alias) : name
    }
    return this.formatSafeName(identifier)
  }

  formatFrom (qs) {
    return `FROM ${this.formatIdentifier(qs.props.target)}`
  }

  formatSelectionExpression (qs, expressionItem) {
    const expr =
      expressionItem instanceof QueryShortcut
        ? expressionItem.breakdown()
        : expressionItem
    if (expr instanceof Array) {
      return this.formatSelection(qs, expr)
    }
    if (expr instanceof QueryColumn) {
      return this.formatQueryColumn(expr)
    }
    if (typeof expr === 'string') {
      return this.formatSafeName(expr)
    }
  }

  formatSelection (qs, selectionExplicit = null) {
    const selection = selectionExplicit || qs.props.selection
    const selectionSql = selection.reduce(
      (aggr, item) => [...aggr, this.formatSelectionExpression(qs, item)],
      []
    )
    return selectionSql.join(', ')
  }

  inverseOperator (operatorName) {
    const map = {
      eq: 'neq',
      gte: 'lt',
      gt: 'lte',
      lte: 'gt',
      lt: 'gte',
      neq: 'eq',
      in: 'notin',
      notin: 'in'
    }
    return map[operatorName]
  }

  formatJoinDirective (qs, join) {
    if (!join.alias) {
      throw new QueryFormatterError(
        `Missing alias for join "${JSON.stringify(join, null, 2)}"`
      )
    }
    return `${join.side} JOIN ${this.formatIdentifier(
      join
    )} ON (${this.formatQueryCondition(qs, join.props.conditions)})`
  }

  formatJoin (qs) {
    return qs.props.joins
      ? qs.props.joins.map(join => this.formatJoinDirective(qs, join)).join(' ')
      : ''
  }

  formatOrderDirective (qs, oi) {
    const [name, descending] = this.parseOrderDirective(oi)
    const columnName = this.formatQueryColumn(
      new QueryColumn({ source: qs.props.target, name })
    )
    return descending ? `${columnName} DESC` : columnName
  }

  formatOrderBy (qs) {
    if (qs.props.orderBy) {
      const order =
        qs.props.orderBy instanceof Array
          ? qs.props.orderBy
          : [qs.props.orderBy]
      if (order.length > 0) {
        const directive = order
          .map(oi => this.formatOrderDirective(qs, oi))
          .join(', ')
        return `ORDER BY ${directive}`
      }
    }
    return ''
  }

  formatLimit (qs) {
    if (qs.props.limit) {
      return `LIMIT ${qs.props.limit}`
    }
    return ''
  }

  formatOffset (qs) {
    if (qs.props.offset) {
      return `OFFSET ${qs.props.offset}`
    }
    return ''
  }
}

module.exports = {
  SqlSelectFormatter
}
