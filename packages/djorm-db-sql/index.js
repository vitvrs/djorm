const { Delete } = require('djorm/db/Delete')
const { Insert } = require('djorm/db/Insert')
const { QueryAllRecords } = require('djorm/db/QueryAllRecords')
const { QueryColumn } = require('djorm/db/QueryColumn')
const { QueryFormatterError } = require('djorm/db/errors')
const { QueryFunc } = require('djorm/db/QueryFunc')
const { QueryShortcut } = require('djorm/db/QueryShortcut')
const { Select } = require('djorm/db/Select')
const { Update } = require('djorm/db/Update')
const { SqlFormatterBase } = require('./SqlFormatterBase')

class SqlFormatter extends SqlFormatterBase {
  headers = {
    [Delete]: 'DELETE',
    [Insert]: 'INSERT',
    [Select]: 'SELECT',
    [Update]: 'UPDATE'
  }

  formatQuery (qs) {
    if (qs instanceof Delete) {
      return this.formatDelete(qs)
    }
    if (qs instanceof Select) {
      return this.formatSelect(qs)
    }
    if (qs instanceof Insert) {
      return this.formatInsert(qs)
    }
    if (qs instanceof Update) {
      return this.formatUpdate(qs)
    }
    throw new QueryFormatterError('Unknown query type')
  }

  formatDelete (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatDeleteTarget(qs),
      this.formatWhere(qs)
    )
  }

  formatInsert (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatInsertTarget(qs),
      this.formatInsertValues(qs)
    )
  }

  formatSelect (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatDistinction(qs),
      this.formatSelection(qs),
      this.formatSelectTarget(qs),
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

  formatUpdate (qs) {
    return this.formatSqlParts(
      this.formatHeader(qs),
      this.formatUpdateTarget(qs),
      this.formatUpdateValues(qs),
      this.formatWhere(qs)
    )
  }

  formatHeader (qs) {
    return this.headers[qs.constructor]
  }

  formatDistinction (qs) {
    if (!qs.props.distinct) {
      return ''
    }
    const args = this.formatSelection(qs, [qs.props.distinct])
    const argsStr = args ? `(${args})` : ''
    return `DISTINCT${argsStr}`
  }

  formatAlias (statement, alias) {
    return `${statement} AS ${this.formatSafeName(alias)}`
  }

  formatDeleteTarget (qs) {
    return `FROM ${this.formatSafeName(qs.props.target)}`
  }

  formatInsertTarget (qs) {
    return `INTO ${this.formatSafeName(qs.props.target)}`
  }

  formatSelectTarget (qs) {
    return `FROM ${this.formatIdentifier(qs.props.target, true)}`
  }

  formatUpdateTarget (qs) {
    return this.formatSafeName(qs.props.target)
  }

  formatFunc (qs, expr) {
    const sql = `${expr.name}(${this.formatSelection(qs, expr.args)})`
    return expr.alias ? this.formatAlias(sql, expr.alias) : sql
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
    if (expr instanceof QueryAllRecords) {
      return '*'
    }
    if (expr instanceof QueryFunc) {
      return this.formatFunc(qs, expr)
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
      notin: 'in',
      isnull: 'notnull',
      notnull: 'isnull'
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
      join,
      true
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

  formatInsertValues (qs) {
    const values = qs.props.values
    const fields = Object.keys(values).filter(
      key => typeof values[key] !== 'undefined'
    )
    return `(${fields.map(this.formatSafeName).join(',')}) VALUES (${fields.map(
      field => this.formatValue(values[field])
    )})`
  }

  formatUpdateValues (qs) {
    const values = qs.props.values
    const valuesStr = Object.keys(values)
      .filter(key => typeof values[key] !== 'undefined')
      .map(
        field =>
          `${this.formatSafeName(field)} = ${this.formatValue(values[field])}`
      )
      .join(', ')
    return `SET ${valuesStr}`
  }
}

module.exports = {
  SqlFormatter
}
