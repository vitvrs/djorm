const path = require('path')
const pool = require('djorm/db/DatabasePool')
const SqliteDatabase = require('..')
const fields = require('djorm/fields')

const { DatabaseModel } = require('djorm/models')

const setupDb = dbName => async () => {
  const db = new SqliteDatabase({
    path: path.resolve(__dirname, '..', '__samples__', dbName)
  })
  const p = new pool.DatabasePool()
  await p.connect(db)
  pool.instance = p
}

describe('select', () => {
  describe('users-trivial', () => {
    let models

    beforeEach(setupDb('users-trivial.sqlite'))

    beforeEach(async () => {
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

      User.register()
      models = { User }
    })

    afterEach(async () => {
      await pool.disconnect()
    })

    it('selects all users', async () => {
      const result = await models.User.objects.all()
      expect(result).toEqual([
        new models.User({
          id: 1,
          name: 'Harmony Vasquez',
          email: 'harmony.vasquez@gmail.com',
          superuser: false,
          inactive: false
        }),
        new models.User({
          id: 2,
          name: 'Jasper Fraley',
          email: 'jasper.fraley@seznam.cz',
          superuser: true,
          inactive: false
        }),
        new models.User({
          id: 3,
          name: 'Neil Henry',
          email: 'neil.henry@iol.com',
          superuser: false,
          inactive: true
        }),
        new models.User({
          id: 4,
          name: 'Merver Chin',
          email: 'merver.chin@gmail.com',
          superuser: true,
          inactive: false
        })
      ])
    })

    it('selects all users ordered by alphabet in reverse', async () => {
      const result = await models.User.objects.orderBy('-name').all()
      expect(result).toEqual([
        new models.User({
          id: 3,
          name: 'Neil Henry',
          email: 'neil.henry@iol.com',
          superuser: false,
          inactive: true
        }),
        new models.User({
          id: 4,
          name: 'Merver Chin',
          email: 'merver.chin@gmail.com',
          superuser: true,
          inactive: false
        }),
        new models.User({
          id: 2,
          name: 'Jasper Fraley',
          email: 'jasper.fraley@seznam.cz',
          superuser: true,
          inactive: false
        }),
        new models.User({
          id: 1,
          name: 'Harmony Vasquez',
          email: 'harmony.vasquez@gmail.com',
          superuser: false,
          inactive: false
        })
      ])
    })

    it('selects first superadmin', async () => {
      const result = await models.User.objects
        .filter({ superuser: true })
        .first()
      expect(result).toEqual(
        new models.User({
          id: 2,
          name: 'Jasper Fraley',
          email: 'jasper.fraley@seznam.cz',
          superuser: true,
          inactive: false
        })
      )
    })

    it('selects last superadmin', async () => {
      const result = await models.User.objects
        .filter({ superuser: true })
        .last()
      expect(result).toEqual(
        new models.User({
          id: 4,
          name: 'Merver Chin',
          email: 'merver.chin@gmail.com',
          superuser: true,
          inactive: false
        })
      )
    })
  })

  describe('users-trivial', () => {
    let models

    beforeEach(setupDb('users-and-roles.sqlite'))

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
})
