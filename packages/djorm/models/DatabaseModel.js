const { DatabaseModelBase } = require('./DatabaseModelBase')
const { Delete } = require('../db/Delete')
const { ForeignKey } = require('../fields/ForeignKey')
const { getDb } = require('../db/DatabasePool')
const { Insert } = require('../db/Insert')
const { ObjectManager } = require('./ObjectManager')
const { ObjectNotFound } = require('../errors')
const { parseFieldObjects } = require('./AttrModel')
const { Relation } = require('../fields/Relation')
const { Update } = require('../db/Update')
const {
  getModelName,
  getRelationship,
  registerModel
} = require('./ModelRegistry')

class DatabaseModel extends DatabaseModelBase {
  static NotFound = ObjectNotFound
  static pkName = 'id'
  static tableName = null
  static manager = ObjectManager
  static dbName = 'default'

  static meta = class {
    static abstract = true
  }

  static get objects () {
    if (!this.managerInstance) {
      const Manager = this.manager
      this.managerInstance = new Manager(this)
    }
    return this.managerInstance
  }

  static get db () {
    return getDb(this.dbName)
  }

  static get table () {
    return this.tableName || getModelName(this).toLowerCase()
  }

  static get relationFields () {
    return this.fieldObjects.filter(
      ([fieldName, field]) => field instanceof Relation
    )
  }

  static get foreignKeyFields () {
    return this.relationFields.filter(
      ([fieldName, field]) => field instanceof ForeignKey
    )
  }

  static register () {
    return registerModel(this)
  }

  get pk () {
    return this[this.constructor.pkName]
  }

  rel (relatedName) {
    return getRelationship(this.constructor, relatedName).queryParentModel(this)
  }

  async fetchRelationship (fieldName) {
    if (!this.get(fieldName)) {
      this.setValue(
        fieldName,
        await this.constructor.getField(fieldName).fetch(this)
      )
    }
  }

  async saveForeignKeys () {
    const values = await Promise.all(
      this.constructor.foreignKeyFields
        .map(([fieldName, field]) => [field, this.get(fieldName)])
        .filter(([field, value]) => Boolean(value))
        .map(async ([field, value]) => [field, await value.save()])
    )
    values.forEach(([field, value]) => {
      this.setValue(field.keyField, value.get(value.constructor.pkName))
    })
  }

  async create () {
    await this.saveForeignKeys()
    const cascade = this.serializeDbValues()
    let inject = {}
    for (const row of cascade) {
      const result = await new Insert()
        .target(row.model)
        .values({ ...row.values, ...inject })
        .exec()
      if (result.insertId) {
        this.setValue(row.model.pkName, result.insertId)
        // Set this back to the cascade ^^
        inject = { ...inject, [row.model.pkName]: result.insertId }
      }
    }
    return this
  }

  async update () {
    await this.saveForeignKeys()
    const cascade = this.serializeDbValues()
    for (const row of cascade) {
      await new Update()
        .target(row.model)
        .values(row.values)
        .filter({ [row.model.pkName]: this.pk })
        .exec()
    }
    return this
  }

  async save () {
    if (this.pk) {
      return await this.update()
    }
    return await this.create()
  }

  async delete () {
    let obj = this.constructor
    while (obj && obj !== DatabaseModel && (!obj.meta || !obj.meta.abstract)) {
      await new Delete()
        .target(obj)
        .filter({ [obj.pkName]: this.pk })
        .exec()
      obj = Object.getPrototypeOf(obj)
    }
  }

  serializeDbValues () {
    let values = []
    let obj = this.constructor

    do {
      values = values.concat({
        model: obj,
        values: parseFieldObjects(obj)
          .filter(([key, field]) => field.db)
          .reduce(
            (aggr, [key, field]) => ({
              ...aggr,
              [key]: this.get(key)
            }),
            {}
          )
      })
      obj = Object.getPrototypeOf(obj)
    } while (obj && obj !== DatabaseModel && (!obj.meta || !obj.meta.abstract))
    return values.reverse()
  }
}

module.exports = {
  DatabaseModel,
  ObjectManager
}
