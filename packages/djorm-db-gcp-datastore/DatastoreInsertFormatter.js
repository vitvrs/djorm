const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreInsertFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => {
      await this.driver.waitForConnection()
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
}

module.exports = { DatastoreInsertFormatter }
