const { AttrModel, Field } = require('../models/AttrModel')
const { CharField } = require('./CharField')
const { ObjectField } = require('./ObjectField')
const { ConfigError } = require('../errors')

let systemDefaultStorage = null

function getSystemDefaultStorage () {
  if (!systemDefaultStorage) {
    throw new ConfigError(
      'Default system storage needs to be configured to use FileField'
    )
  }
  return systemDefaultStorage
}

function setSystemDefaultStorage (storage) {
  systemDefaultStorage = storage
}

function getFieldValue (inst, fieldName) {
  return fieldName && inst.get(fieldName)
}

class FileStorage extends AttrModel {
  getReadStream (filePath) {}
  getWriteStream (filePath) {}
  async exists (filePath) {}
  async read (filePath) {}
  async readMeta (filePath) {}
  async write (filePath, data) {}
}

class File extends AttrModel {
  static storage = new ObjectField({ model: FileStorage })
  static basePath = new CharField()
  static name = new CharField()

  static meta = {
    modelName: 'File'
  }

  get filePath () {
    return [this.get('basePath'), this.get('name')].join('/')
  }

  get readStream () {
    return this.storage.getReadStream(this.filePath)
  }

  get writeStream () {
    return this.storage.getWriteStream(this.filePath)
  }

  async exists () {
    return await this.storage.exists(this.filePath)
  }

  async read () {
    return await this.storage.read(this.filePath)
  }

  async readMeta () {
    return await this.storage.readMeta(this.filePath)
  }

  async write (data) {
    return await this.storage.write(this.filePath, data)
  }
}

class FileField extends Field {
  static basePath = new CharField()
  static model = new ObjectField({ default: () => File, model: Object })
  static storage = new ObjectField({ model: FileStorage, null: true })
  static defaultStorage = new ObjectField({
    default: getSystemDefaultStorage,
    model: FileStorage
  })

  resolveStorage () {
    return this.get('storage') || this.get('defaultStorage')
  }
}

class NamedFileField extends FileField {
  static nameField = new Field()
  static basePathField = new Field()
  static storageField = new Field({ null: true })

  parse (value, inst) {
    return this.get('model').from({
      storage: this.resolveStorage(this),
      basePath: getFieldValue(inst, this.basePathField) || this.get('basePath'),
      name: getFieldValue(inst, this.nameField)
    })
  }

  resolveStorage (inst) {
    return getFieldValue(inst, this.storageField) || super.resolveStorage()
  }
}

module.exports = {
  getSystemDefaultStorage,
  setSystemDefaultStorage,
  File,
  FileStorage,
  FileField,
  NamedFileField
}
