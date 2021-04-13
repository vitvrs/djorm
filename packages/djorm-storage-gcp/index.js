const { Storage } = require('@google-cloud/storage')
const {
  CharField,
  FileStorage,
  setSystemDefaultStorage
} = require('ig11-djorm/fields')

class GcpFileStorage extends FileStorage {
  static projectId = new CharField()
  static clientEmail = new CharField()
  static privateKey = new CharField()
  static bucketName = new CharField()

  get storage () {
    return new Storage({
      projectId: this.get('projectId'),
      credentials: {
        client_email: this.get('clientEmail'),
        private_key: this.get('privateKey').replace(/\\n/g, '\n')
      }
    })
  }

  get bucket () {
    return this.storage.bucket(this.bucketName)
  }

  file (filePath) {
    return this.bucket.file(filePath)
  }

  getReadStream (filePath) {
    return this.file(filePath).getReadStream()
  }

  getWriteStream (filePath) {
    return this.file(filePath).getWriteStream()
  }

  async exists (filePath) {
    const response = await this.file(filePath).exists()
    return Boolean(response[0])
  }

  async read (filePath) {
    throw new Error('Not implemented')
  }

  async readMeta (filePath) {
    const response = await this.file(filePath).getMetadata()
    return response[0]
  }

  async write (filePath, data) {
    await this.file(filePath).save(data)
  }
}

function useAsDefault (props) {
  setSystemDefaultStorage(new GcpFileStorage(props))
}

module.exports = { GcpFileStorage, useAsDefault }
