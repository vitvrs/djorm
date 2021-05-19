const { DatabaseModel } = require('djorm/models')
const { EntityOperation } = require('./entities')
const { CharField } = require('djorm/fields/CharField')
const { ObjectArrayField } = require('djorm/fields/ObjectArrayField')

class DatabaseMigration extends DatabaseModel {
  static identifier = new CharField({ unique: true })
  static operations = new ObjectArrayField({ objectClass: EntityOperation })
}

module.exports = { DatabaseMigration }
