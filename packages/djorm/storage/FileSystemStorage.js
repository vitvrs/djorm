const { Storage } = require('./Storage')
const { createReadStream, createWriteStream } = require('fs')
const { stat, readdir, readFile, writeFile } = require('fs/promises')

module.exports = class FileSystemStorage extends Storage {
  getReadStream = filePath => createReadStream(filePath)
  getWriteStream = filePath => createWriteStream(filePath)
  readDir = dirPath => readdir(dirPath, { withFileTypes: true })
  read = filePath => readFile(filePath)
  readMeta = filePath => stat(filePath)
  write = (filePath, data) => writeFile(filePath, data)

  exists = async filePath => {
    try {
      await this.readMeta(filePath)
      return true
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false
      }
      throw e
    }
  }
}
