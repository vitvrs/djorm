const { AttrModel, parseFieldObjects } = require('./AttrModel')
const { filterUnique } = require('../filters')
const { ForeignKey } = require('../fields/ForeignKey')
const { NotConnected, ObjectNotFound } = require('../errors')
const { getModelName } = require('./ModelRegistry')

let dbConnection

function connectToDb (db) {
  dbConnection = db
}

function getDb () {
  if (!dbConnection || !dbConnection.connected) {
    throw new NotConnected('Models are not connected to the database')
  }
  return dbConnection
}

class ObjectManager {
  constructor (model) {
    this.model = model
  }

  get query () {
    let selection = []
    let joins = []
    let obj = this.model
    do {
      const fields = parseFieldObjects(obj).filter(([key, field]) => field.db)
      const fieldNames = fields.map(([key]) => key).filter(filterUnique)
      const last = selection[selection.length - 1]
      if (obj.meta && obj.meta.abstract && last) {
        last.names = last.names.concat(fieldNames)
      } else {
        if (obj !== this.model) {
          joins = joins.concat([
            {
              table: obj.tableName,
              alias: obj.tableName,
              on: [
                {
                  left: { source: obj.tableName, name: obj.pkName },
                  column: {
                    source: this.model.tableName,
                    name: this.model.pkName
                  }
                }
              ]
            }
          ])
        }
        selection = selection.concat({
          source: obj.tableName,
          names: fieldNames
        })
      }
      obj = Object.getPrototypeOf(obj)
    } while (obj && obj !== DatabaseModel)
    return {
      table: this.model.table,
      selection,
      joins
    }
  }

  async all (where) {
    const Model = this.model
    const items = await getDb().select({
      ...this.query,
      where
    })
    return items.map(item => new Model(item))
  }

  async findOne (where) {
    const Model = this.model
    const item = await getDb().selectOne({
      ...this.query,
      where
    })
    return item ? new Model(item) : item
  }

  async requireOne (where) {
    const obj = await this.findOne(where)
    if (!obj) {
      throw new ObjectNotFound(
        `Could not find "${getModelName(
          this.model
        )}" specified by "${JSON.stringify(where)}"`
      )
    }
    return obj
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

class DatabaseModel extends AttrModel {
  static NotFound = ObjectNotFound
  static pkName = 'id'
  static tableName = null
  static manager = ObjectManager

  static meta = class {
    static abstract = true
  }

  static get objects () {
    const Manager = this.manager
    return new Manager(this)
  }

  static get table () {
    return this.tableName
  }

  static get dbName () {
    return getModelName(this)
  }

  async fetchRelationship (fieldName) {
    if (!this.getValue(fieldName)) {
      this.setValue(
        fieldName,
        await this.constructor.getField(fieldName).fetch(this)
      )
    }
  }

  get foreignKeys () {
    return this.constructor.fieldObjects.filter(
      ([fieldName, field]) => field instanceof ForeignKey
    )
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

  getDb = getDb

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
  connectToDb,
  DatabaseModel,
  ObjectManager
}
