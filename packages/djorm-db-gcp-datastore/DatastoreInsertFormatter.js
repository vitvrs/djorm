const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreInsertFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => {
      const values = await this.prepareKeys(qs, this.formatValues(qs))
      await this.db.upsert(values)
      const last = values[values.length - 1]
      return {
        insertId: this.getKeyValue(last)
      }
    }
  }

  prepareKeys = async (qs, values) => {
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
