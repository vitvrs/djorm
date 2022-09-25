const { DriverModel } = require('../models/DriverModel')

class Storage extends DriverModel {
  getReadStream (filePath) {}
  getWriteStream (filePath) {}

  async exists (filePath) {}
  async read (filePath) {}
  async readDir (dirPath) {}
  async readMeta (filePath) {}
  async write (filePath, data) {}
}

module.exports = { Storage }
