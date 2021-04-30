const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreInsertFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => {
      const values = await this.prepareKeys(qs, this.formatValues(qs))
      await this.db.insert(values)
      return {
        insertId: values.length && values[values.length - 1].key.id
      }
    }
  }

  prepareKeys = async (qs, values) => {
    const keyLess = values.filter(item => !item.key.id)
    const partialKey = this.formatKey(qs.props.model)
    const [ids] = await this.db.allocateIds(partialKey, keyLess.length)
    return values.map(item =>
      item.key.id
        ? item
        : {
            ...item,
            key: ids.shift()
          }
    )
  }

  formatValue = (qs, data) => ({
    key: this.formatKey(qs.props.model, data[qs.model.pkName]),
    data
  })

  formatValues = qs =>
    qs.props.values instanceof Array
      ? qs.props.values.map(data => this.formatValue(qs, data))
      : [this.formatValue(qs, qs.props.values)]
}

module.exports = { DatastoreInsertFormatter }
