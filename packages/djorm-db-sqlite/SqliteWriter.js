const { Writable } = require('stream')

class SqliteWriter extends Writable {
  constructor (base, model) {
    super({ objectMode: true })
    this.base = base
    this.model = model
    this.saveChunkItem = this.saveChunkItem.bind(this)
  }

  async saveChunkItem (item) {
    const inst = item instanceof this.model ? item : this.model.from(item)
    return await inst.save()
  }

  async _write (chunk, enc, next) {
    try {
      await (chunk instanceof Array
        ? Promise.all(chunk.map(this.saveChunkItem))
        : this.saveChunkItem(chunk))
      next()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = { SqliteWriter }
