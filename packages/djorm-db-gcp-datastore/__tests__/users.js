const fields = require('djorm/fields')
const path = require('path')
const hub = require('djorm/db/DatabaseHub')

const { setupDb } = require('__jest__/datastore')
const { DatabaseModel } = require('djorm/models')
const { TargetStream } = require('__mocks__/TargetStream')

describe.skip('datastore select', () => {
  let models

  setupDb(path.resolve(__dirname, '..', '__samples__', 'users-trivial.js'))

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
        .on('error', reject)
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
    const result = await models.User.objects.filter({ superuser: true }).first()
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
    const result = await models.User.objects.filter({ superuser: true }).last()
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

  it('selects user by id', async () => {
    const result = await models.User.objects.get({ id: 4 })
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

  it('ignores undefined conditions', async () => {
    const result = await models.User.objects
      .filter({
        name: 'Merver Chin',
        superuser: undefined,
        inactive: undefined
      })
      .first()
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

  it('inserts user', async () => {
    const user = new models.User({
      name: 'John Runner',
      email: 'test.runner@gmail.com',
      superuser: false,
      inactive: false
    })
    await user.save()
    expect(
      await models.User.objects.filter({ name: 'John Runner' }).first()
    ).toEqual(
      expect.objectContaining({
        name: 'John Runner',
        email: 'test.runner@gmail.com',
        superuser: false,
        inactive: false
      })
    )
  })

  it('inserts user with specific ID', async () => {
    class DefaultIdUser extends DatabaseModel {
      static id = new fields.PositiveIntegerField({ default: () => 1001 })
      static name = new fields.CharField()
      static email = new fields.CharField()
      static superuser = new fields.BooleanField()
      static inactive = new fields.BooleanField()
      static tableName = 'user'

      static meta = class {
        static modelName = 'DefaultIdUser'
      }
    }
    const user = new DefaultIdUser({
      name: 'John Runner',
      email: 'test.runner@gmail.com',
      superuser: false,
      inactive: false
    })
    await user.save()
    expect(await DefaultIdUser.objects.get({ id: 1001 })).toEqual(
      expect.objectContaining({
        id: 1001,
        name: 'John Runner',
        email: 'test.runner@gmail.com',
        superuser: false,
        inactive: false
      })
    )
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
})
