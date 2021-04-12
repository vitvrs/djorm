const {
  QueryColumn,
  QueryIdentifier,
  QuerySetMode,
  QueryShortcut
} = require('djorm/db')
const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { LogicOperator } = require('djorm/db/LogicOperator')
const { QueryFormatter } = require('djorm/db/QueryFormatter')
const { QueryFormatterError } = require('djorm/db/errors')
const { Q } = require('djorm/db/QueryCondition')

const nonEmpty = item => Boolean(item)

class SqlFormatter extends QueryFormatter {
  formatQuerySet (qs) {
    if (qs.mode === QuerySetMode.select) {
      return this.formatSelect(qs)
    }
  }

  /** Format string parts of a query
   * @param {...(string|string[])}
   * @returns string
   */
  formatSqlParts (...parts) {
    return parts
      .reduce((aggr, part) => {
        if (part instanceof Array) {
          return aggr.concat(part)
        }
        return [...aggr, part]
      }, [])
      .filter(item => Boolean(item))
      .join(' ')
  }

  formatSelect (qs) {
    return this.formatSqlParts(
      this.formatSelectHeader(qs),
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

  formatSafeName (sqlIdentifier) {
    return `\`${sqlIdentifier}\``
  }

  formatSelectHeader (qs) {
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
    return `FROM ${this.formatIdentifier(qs.props.from)}`
  }

  formatQueryColumn (expr, ignoreAlias = false) {
    const source = [
      expr.source && this.formatSafeName(expr.source),
      this.formatSafeName(expr.name)
    ]
      .filter(nonEmpty)
      .join('.')
    const alias = [expr.prefix, expr.alias || (expr.prefix && expr.name)]
      .filter(nonEmpty)
      .join('__')
    return alias && !ignoreAlias ? this.formatAlias(source, alias) : source
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

  resolveOperatorName (condition, fieldSpec) {
    const operatorKey = fieldSpec.match(this.operatorMatch)
    const operatorName = (operatorKey && operatorKey[1]) || 'eq'
    return condition.shouldNegate()
      ? this.inverseOperator(operatorName)
      : operatorName
  }

  formatOperatorExpression (operator, value) {
    if (
      operator === ComparisonOperator.in ||
      operator === ComparisonOperator.notin
    ) {
      return `${operator} (${value.map(this.formatValue).join(',')})`
    }
    return `${operator} ${this.formatValue(value)}`
  }

  formatValue (value) {
    if (value instanceof QueryColumn) {
      return this.formatQueryColumn(value, true)
    }
    return super.formatValue(value)
  }

  formatConditionExpression (qs, condition, fieldSpec, value) {
    const operatorName = this.resolveOperatorName(condition, fieldSpec)
    const operator = ComparisonOperator[operatorName]
    const fieldName = fieldSpec.replace(this.operatorMatch, '')
    const col = new QueryColumn(fieldName)
    if (!col.source) {
      col.props.source = qs.props.from
    }
    const field = this.formatQueryColumn(col, true)
    return `${field} ${this.formatOperatorExpression(operator, value)}`
  }

  formatConditionBrackets (condition, str) {
    const multiple =
      condition instanceof Q
        ? condition.hasMultipleConditions()
        : Object.keys(condition).length > 1
    return multiple ? `(${str})` : str
  }

  formatSubCondition (qs, condition, conditionProps) {
    if (conditionProps instanceof Q) {
      conditionProps.parent(condition)
      return this.formatQueryCondition(qs, conditionProps)
    }
    return this.formatConditionBrackets(
      conditionProps,
      Object.entries(conditionProps)
        .map(([fieldSpec, value]) =>
          this.formatConditionExpression(qs, condition, fieldSpec, value)
        )
        .join(` ${condition.operator} `)
    )
  }

  formatQueryCondition (qs, condition) {
    return this.formatConditionBrackets(
      condition,
      condition.conditions
        .map(c => this.formatSubCondition(qs, condition, c))
        .join(` ${condition.operator} `)
    )
  }

  formatQueryConditions (qs, conditions) {
    return qs.props.conditions
      .map(condition => this.formatQueryCondition(qs, condition))
      .join(` ${LogicOperator.and} `)
  }

  formatWhere (qs) {
    if (qs.props.conditions) {
      return `WHERE ${this.formatQueryConditions(qs, qs.props.conditions)}`
    }
    return ''
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
    const inverse = oi.indexOf('-') === 0
    const fieldSpec = inverse ? oi.substr(1) : oi
    const columnName = this.formatQueryColumn(
      new QueryColumn({ source: qs.props.from, name: fieldSpec })
    )
    return inverse ? `${columnName} DESC` : columnName
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
  SqlFormatter
}
