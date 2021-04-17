const { ComparisonOperator } = require('djorm/db/ComparisonOperator')
const { LogicOperator } = require('djorm/db/LogicOperator')
const { Q } = require('djorm/db/QueryCondition')
const { QueryColumn } = require('djorm/db/QueryColumn')
const { QueryFormatter } = require('djorm/db/QueryFormatter')

const nonEmpty = item => Boolean(item)

class SqlFormatterBase extends QueryFormatter {
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

  formatSafeName (sqlIdentifier) {
    return `\`${sqlIdentifier}\``
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

  formatOperatorExpression (operator, value) {
    if (
      operator === ComparisonOperator.in ||
      operator === ComparisonOperator.notin
    ) {
      return `${operator} (${value
        .map(value => this.formatValue(value))
        .join(',')})`
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
      col.props.source = qs.props.target
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
}

module.exports = { SqlFormatterBase }
