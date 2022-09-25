const storageHub = require('../storage/StorageHub')

const { v4 } = require('uuid')
const { basename } = require('path')
const { AttrModel, Field } = require('../models/AttrModel')
const { createReadStream } = require('fs')
const { CharField } = require('./CharField')
const { ObjectField } = require('./ObjectField')
const { pipeline } = require('stream')

class File extends AttrModel {
  static storageName = new CharField({ default: 'default' })
  static basePath = new CharField()
  static name = new CharField()
  static src = new Field()

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
  save = async () => {
    if (this.src) {
      const src =
        this.src.pipe instanceof Function
          ? this.src
          : createReadStream(this.src)
      await new Promise((resolve, reject) =>
        pipeline(src, this.writeStream, e => {
          if (e) {
            reject(e)
          } else {
            resolve()
          }
        })
      )
    }
  }
}

class FileField extends Field {
  static fileField = true
  static basePath = new CharField()
  static model = new ObjectField({ default: () => File, model: Object })
  static storageName = new CharField({ default: 'default' })
  db = true

  get storage () {
    return storageHub.get(this.storageName)
  }

  parse (value, inst) {
    if (value) {
      return this.get('model').from({
        storageName: this.get('storageName'),
        basePath: this.get('basePath'),
        name:
          (typeof value === 'string' ? basename(value) : value.name) || v4(),
        src: typeof value === 'string' ? value : value.src
      })
    }
  }

  toDb (value) {
    if (value) {
      return value.name
    }
    return super.toDb(value)
  }

  async saveFileValue (inst, fieldName, value) {
    if (value) {
      await value.save()
    }
  }
}

const getFieldValue = (inst, fieldName) => fieldName && inst.get(fieldName)

class NamedFileField extends FileField {
  static nameField = new Field()
  static basePathField = new Field()
  static storageField = new Field({ null: true })

  parse (value, inst) {
    if (value) {
      return this.get('model').from({
        storageName: this.storageName,
        basePath:
          getFieldValue(inst, this.basePathField) || this.get('basePath'),
        name: getFieldValue(inst, this.nameField) || v4()
      })
    }
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
