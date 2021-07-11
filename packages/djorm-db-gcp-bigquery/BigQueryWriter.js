const { Writable } = require('stream')

class BigQueryWriter extends Writable {
  constructor (base, model) {
    super({ objectMode: true })
    this.base = base
    this.model = model
    this.tableName = this.model.tableName
    this.schemaName = this.base.props.schema
  }

  formatChunk (chunk) {
    return chunk.serializeDbValues ? chunk.serializeDbValues() : chunk
  }

  async _write (chunk, enc, next) {
    try {
      await this.base.waitForConnection()
      const dataset = this.base.getDataset(this.schemaName)
      const table = dataset.table(this.tableName)
      const data =
        chunk instanceof Array
          ? chunk.map(this.formatChunk)
          : this.formatChunk(chunk)
      await table.insert(data)
      next()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = { BigQueryWriter }
