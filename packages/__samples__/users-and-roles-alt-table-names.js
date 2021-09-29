const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { init, shutdown } = require('djorm/config')
const { DatabaseModel, clearModels } = require('djorm/models')
const { setupTests } = require('./users-and-roles')

const setupModels = () => {
  beforeEach(() => {
    class User extends DatabaseModel {
      static tableName = 'user-alternative'
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
      static tableName = 'role-alternative'
      static id = new fields.PositiveIntegerField()
      static name = new fields.CharField()

      static meta = class {
        static modelName = 'Role'
      }
    }

    class UserRole extends DatabaseModel {
      static tableName = 'userrole-alternative'
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

    User.register()
    Role.register()
    UserRole.register()
  })
}

const setupSuite = ({ testForeignKeys = true } = {}) => {
  beforeEach(() => {
    advanceTo(new Date(Date.UTC(2021, 4, 25, 0, 0, 0)))
  })

  setupModels()

  beforeEach(init)

  afterEach(shutdown)

  afterEach(async () => {
    clearModels()
    clear()
  })

  setupTests({ testForeignKeys })
}

module.exports = { setupSuite }
