/* istanbul ignore file */

const fields = require('djorm/fields')
const path = require('path')
const config = require('djorm/config')

const { DatabaseModel } = require('djorm/models')

class User extends DatabaseModel {
  static id = new fields.PositiveIntegerField()
  static name = new fields.CharField()
  static email = new fields.CharField()
  static superuser = new fields.BooleanField()
  static inactive = new fields.BooleanField()

  static meta = class {
    static modelName = 'User'
  }
}

class Role extends DatabaseModel {
  static id = new fields.PositiveIntegerField()
  static name = new fields.CharField()

  static meta = class {
    static modelName = 'Role'
  }
}

class UserRole extends DatabaseModel {
  static id = new fields.PositiveIntegerField()
  static user = new fields.ForeignKey({
    model: 'User',
    relatedName: 'userRoles'
  })

  static role = new fields.ForeignKey({
    model: 'Role',
    relatedName: 'userRoles'
  })
}

class AuditLog extends DatabaseModel {
  static test = new fields.TextField()
  static createdAt = new fields.DateTimeField()
}

const initialize = async () => {
  AuditLog.register()
  Role.register()
  User.register()
  UserRole.register()
  await config.init({
    databases: {
      default: {
        driver: 'djorm-db-sqlite',
        path: path.join(__dirname, 'db.sqlite')
      }
    }
  })
}

module.exports = {
  AuditLog,
  User,
  Role,
  UserRole,
  initialize,
  shutdown: config.shutdown
}
