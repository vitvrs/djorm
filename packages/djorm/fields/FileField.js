const storageHub = require('../storage/StorageHub')

const { AttrModel, Field } = require('../models/AttrModel')
const { CharField } = require('./CharField')
const { ObjectField } = require('./ObjectField')

class File extends AttrModel {
  static storageName = new CharField()
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

  get storage () {
    return storageHub.get(this.storageName)
  }

  get writeStream () {
    return this.storage.getWriteStream(this.filePath)
  }

  exists = () => this.storage.exists(this.filePath)
  read = () => this.storage.read(this.filePath)
  readMeta = () => this.storage.readMeta(this.filePath)
  write = data => this.storage.write(this.filePath, data)
}

class FileField extends Field {
  static basePath = new CharField()
  static model = new ObjectField({ default: () => File, model: Object })
  static storageName = new CharField()

  get storage () {
    return storageHub.get(this.storageName)
  }

  parse (value, inst) {
    return this.get('model').from({
      storageName: this.get('storageName'),
      basePath: this.get('basePath'),
      name: value.name
    })
  }
}

const getFieldValue = (inst, fieldName) => fieldName && inst.get(fieldName)

class NamedFileField extends FileField {
  static nameField = new Field()
  static basePathField = new Field()
  static storageField = new Field({ null: true })

  parse (value, inst) {
    return this.get('model').from({
      storageName: this.storageName,
      basePath: getFieldValue(inst, this.basePathField) || this.get('basePath'),
      name: getFieldValue(inst, this.nameField)
    })
  }

  resolveStorage (inst) {
    return getFieldValue(inst, this.storageField) || super.resolveStorage()
  }
}

module.exports = {
  File,
  FileField,
  NamedFileField
}
