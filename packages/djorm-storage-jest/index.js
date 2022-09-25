const { Storage } = require('djorm/storage/Storage')

class JestFileStorage extends Storage {
  getReadStream = jest.fn()
  getWriteStream = jest.fn()
  exists = jest.fn()
  read = jest.fn()
  readDir = jest.fn()
  readMeta = jest.fn()
  write = jest.fn()
}

module.exports = { JestFileStorage }
