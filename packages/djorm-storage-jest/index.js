const { FileStorage, setSystemDefaultStorage } = require('djorm/fields')

class JestFileStorage extends FileStorage {
  getReadStream = jest.fn()
  getWriteStream = jest.fn()
  exists = jest.fn()
  read = jest.fn()
  readMeta = jest.fn()
  write = jest.fn()
}

function useAsDefault () {
  setSystemDefaultStorage(new JestFileStorage())
}

module.exports = { JestFileStorage, useAsDefault }
