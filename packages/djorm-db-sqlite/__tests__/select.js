const path = require('path')
const hub = require('djorm/db/DatabaseHub')
const SqliteDatabase = require('..')
const fields = require('djorm/fields')
const tmp = require('tmp-promise')

const { promises } = require('fs')
const { DatabaseModel } = require('djorm/models')
const { TargetStream } = require('__mocks__/TargetStream')

const setupDb = dbName => {
  let tmpFile
  beforeEach(async () => {
    const dbPath = path.resolve(__dirname, '..', '__samples__', dbName)
    tmpFile = await tmp.file()
    await promises.copyFile(dbPath, tmpFile.path)
    const db = new SqliteDatabase({
      path: tmpFile.path
    })
    const p = new hub.DatabaseHub()
    await p.connectDb(db)
    hub.instance = p
  })

  afterEach(async () => {
    await tmpFile.cleanup()
  })
}

describe('select', () => {
  describe('users-trivial', () => {
    let models

    setupDb('users-trivial.sqlite')

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

      class Campaign extends DatabaseModel {
        static id = new fields.PositiveIntegerField()
        static name = new fields.CharField()
      }

      class JobBase extends DatabaseModel {
        static id = new fields.PositiveIntegerField()
        static status = new fields.CharField()
        static props = new fields.JsonField()
        static createdAt = new fields.DateTimeField()
        static updatedAt = new fields.DateTimeField()
        static meta = class {
          static abstract = true
        }

        async create () {
          this.createdAt = new Date()
          return await super.create()
        }

        async update () {
          this.updatedAt = new Date()
          return await super.update()
        }
      }

      class Job extends JobBase {
        static campaign = new fields.ForeignKey({ model: 'Campaign' })
        static client = new fields.ForeignKey({
          model: 'User',
          keyField: 'clientId'
        })
      }

      User.register()
      Job.register()
      Campaign.register()
      models = { Campaign, Job, User }
    })

    afterEach(async () => {
      await hub.disconnect()
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

    it('streams all users', async () => {
      const dest = new TargetStream()
      const src = await models.User.objects.stream()
      await new Promise((resolve, reject) => {
        src
          .pipe(dest)
          .on('error', reject)
          .on('finish', resolve)
      })

      expect(dest.data).toEqual([
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

    it('inserts user', async () => {
      const user = new models.User({
        name: 'Test Runner',
        email: 'test.runner@gmail.com',
        superuser: false,
        inactive: false
      })
      await user.save()
      expect(
        await models.User.objects.filter({ name: 'Test Runner' }).first()
      ).toEqual(
        new models.User({
          id: 5,
          name: 'Test Runner',
          email: 'test.runner@gmail.com',
          superuser: false,
          inactive: false
        })
      )
    })

    it('updates new user object primary key', async () => {
      const user = new models.User({
        name: 'John Runner',
        email: 'test.runner@gmail.com',
        superuser: false,
        inactive: false
      })
      await user.save()
      expect(user.pk).not.toBe(null)
      expect(user.pk).not.toBe(undefined)
      expect(typeof user.pk).toBe('number')
    })

    it('deletes user', async () => {
      const user = await models.User.objects.get({ id: 1 })
      await user.delete()
      expect(await models.User.objects.filter({ id: 1 }).first()).toEqual(null)
    })

    it('updates user', async () => {
      const user = await models.User.objects.get({ id: 1 })
      user.name = 'Test Runner 2'
      await user.save()
      expect(await models.User.objects.filter({ id: 1 }).first()).toEqual(
        new models.User({
          id: 1,
          name: 'Test Runner 2',
          email: 'harmony.vasquez@gmail.com',
          superuser: false,
          inactive: false
        })
      )
    })

    it('counts users', async () => {
      expect(await models.User.objects.count()).toBe(4)
    })

    it('creates job', async () => {
      const job = new models.Job({
        status: 'request',
        props: { foo: 'bar' },
        clientId: 1,
        campaignId: 1
      })
      await job.save()
      expect(job.id).toBe(1)
    })
  })

  describe('users-trivial', () => {
    let models

    setupDb('users-and-roles.sqlite')

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
      await hub.disconnect()
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

    it('selects distinct user roles', async () => {
      const user = await models.User.objects.first()
      const items = await user
        .rel('userRoles')
        .distinct()
        .all()
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
