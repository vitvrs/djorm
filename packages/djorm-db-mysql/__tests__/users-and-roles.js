const pool = require('djorm/db/DatabasePool')
const fields = require('djorm/fields')

const { DatabaseModel } = require('djorm/models')
const { setupDb } = require('../__samples__/setup')

describe('mysql select with users-trivial', () => {
  let models

  setupDb('users-and-roles.sql')

  beforeEach(() => {
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

    User.register()
    Role.register()
    UserRole.register()
    models = { User, Role, UserRole }
  })

  afterEach(async () => {
    await pool.disconnect()
  })

  it('selects user roles', async () => {
    const user = await models.User.objects.first()
    const items = await user.rel('userRoles').all()
    expect(items).toEqual([
      new models.UserRole({
        id: 1,
        roleId: 1,
        userId: 1
      }),
      new models.UserRole({
        id: 2,
        roleId: 2,
        userId: 1
      })
    ])
  })
})
