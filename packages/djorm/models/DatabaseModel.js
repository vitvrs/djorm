const { DatabaseModelBase } = require('./DatabaseModelBase')
const { ForeignKey } = require('../fields/ForeignKey')
const { getDb } = require('../db/DatabasePool')
const { getModelName, getRelation, registerModel } = require('./ModelRegistry')
const { ObjectNotFound } = require('../errors')
const { parseFieldObjects } = require('./AttrModel')
const { Relation } = require('../fields/Relation')
const { Select } = require('../db/Select')

class ObjectManager {
  constructor (model) {
    this.model = model
  }

  get db () {
    return this.model.db
  }

  get query () {
    return Select.fromDb(this.db).from(this.model)
  }

  async all () {
    return await this.query.all()
  }

  async first () {
    return await this.query.first()
  }

  async last () {
    return await this.query.last()
  }

  async get (filter) {
    return await this.query.filter(filter).first()
  }

  filter (...args) {
    return this.query.filter(...args)
  }

  orderBy (...args) {
    return this.query.orderBy(...args)
  }
}

function getValuesInsertSql (db, values) {
  const fields = Object.keys(values).filter(
    key => typeof values[key] !== 'undefined'
  )
  return `(${fields.join(',')}) VALUES (${fields.map(field =>
    db.escape(values[field])
  )})`
}

function getValuesUpdateSql (db, values) {
  return Object.keys(values)
    .filter(key => typeof values[key] !== 'undefined')
    .map(field => `${field} = ${db.escape(values[field])}`)
    .join(' , ')
}

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
    const Manager = this.manager
    return new Manager(this)
  }

  static get table () {
    return this.tableName || getModelName(this).toLowerCase()
  }

  static register () {
    return registerModel(this)
  }

  async fetchRelationship (fieldName) {
    if (!this.getValue(fieldName)) {
      this.setValue(
        fieldName,
        await this.constructor.getField(fieldName).fetch(this)
      )
    }
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

  get foreignKeys () {
    return this.constructor.foreignKeyFields
  }

  rel (relatedName) {
    const field = getRelation(this.constructor, relatedName)
    return field.queryParentModel(this)
  }

  async saveForeignKeys () {
    const values = await Promise.all(
      this.foreignKeys
        .map(([fieldName, field]) => [field, this.getValue(fieldName)])
        .filter(([field, value]) => Boolean(value))
        .map(async ([field, value]) => [field, await value.save()])
    )
    values.forEach(([field, value]) => {
      this.setValue(field.keyField, value.getValue(value.constructor.pkName))
    })
  }

  async create () {
    await this.saveForeignKeys()
    const db = this.getDb()
    const cascade = this.serializeDbValues()
    let inject = {}
    for (const row of cascade) {
      const sql = `INSERT INTO ${row.model.table} ${getValuesInsertSql(db, {
        ...row.values,
        ...inject
      })}`
      const result = await db.fetch(sql)
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
    const db = this.getDb()
    const cascade = this.serializeDbValues()
    for (const row of cascade) {
      const sql = `UPDATE ${row.model.table} SET ${getValuesUpdateSql(
        db,
        row.values
      )} WHERE ${row.model.pkName} = ${db.escape(this.pk)}`
      await db.fetchOne(sql)
    }
    return this
  }

  async save () {
    if (this.pk) {
      return await this.update()
    }
    return await this.create()
  }

  get pk () {
    return this[this.constructor.pkName]
  }

  static get db () {
    return getDb(this.dbName)
  }

  async delete () {
    const db = getDb()
    let obj = this.constructor
    while (obj && obj !== DatabaseModel && (!obj.meta || !obj.meta.abstract)) {
      await db.fetch(
        db.format(`DELETE FROM ${obj.table} WHERE id = ?`, [
          this.getValue(obj.pkName)
        ])
      )
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
              [key]: this.getValue(key)
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
