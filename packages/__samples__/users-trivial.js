const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')
const { serialize } = require('djorm/filters')
const { TargetStream } = require('__mocks__/TargetStream')

const setupModels = () => {
  beforeEach(() => {
    class User extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static name = new fields.CharField()
      static email = new fields.CharField()
      static superuser = new fields.BooleanField()
      static inactive = new fields.BooleanField()
      static createdAt = new fields.DateTimeField()

      static meta = class {
        static modelName = 'User'
      }

      async create () {
        this.set('createdAt', new Date())
        return super.create()
      }
    }

    User.register()
  })
}

const setupTests = () => {
  it('selects all users', async () => {
    const result = await getModel('User').objects.all()
    const User = getModel('User')
    expect(result).toEqual([
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
        id: 3,
        name: 'Neil Henry',
        email: 'neil.henry@iol.com',
        superuser: false,
        inactive: true
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      })
    ])
  })

  it('streams all users', async () => {
    const User = getModel('User')
    const dest = new TargetStream()
    const src = await User.objects.stream()
    await new Promise((resolve, reject) => {
      src
        .pipe(dest)
        .on('error', reject)
        .on('finish', resolve)
    })

    expect(dest.data).toEqual([
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
        id: 3,
        name: 'Neil Henry',
        email: 'neil.henry@iol.com',
        superuser: false,
        inactive: true
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      })
    ])
  })

  it('selects all users ordered by alphabet in reverse', async () => {
    const User = getModel('User')
    const result = await getModel('User')
      .objects.orderBy('-name')
      .all()
    expect(result).toEqual([
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
        id: 3,
        name: 'Neil Henry',
        email: 'neil.henry@iol.com',
        superuser: false,
        inactive: true
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      }),
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      })
    ])
  })

  it('selects first superadmin', async () => {
    const User = getModel('User')
    const result = await User.objects.filter({ superuser: true }).first()
    expect(result).toEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      })
    )
  })

  it('selects last superadmin', async () => {
    const User = getModel('User')
    const result = await User.objects.filter({ superuser: true }).last()
    expect(result).toEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      })
    )
  })

  it('inserts user', async () => {
    const User = getModel('User')
    const user = new User({
      name: 'Test Runner',
      email: 'test.runner@gmail.com',
      superuser: false,
      inactive: false
    })
    await user.save()
    expect(
      serialize(await User.objects.filter({ name: 'Test Runner' }).first())
    ).toEqual({
      createdAt: '2021-05-25T00:00:00.000Z',
      id: expect.anything(),
      name: 'Test Runner',
      email: 'test.runner@gmail.com',
      superuser: false,
      inactive: false
    })
  })

  it('updates new user object primary key', async () => {
    const User = getModel('User')
    const user = new User({
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
    const user = await getModel('User').objects.get({ id: 1 })
    await user.delete()
    expect(
      await getModel('User')
        .objects.filter({ id: 1 })
        .first()
    ).toEqual(null)
  })

  it('updates user', async () => {
    const User = getModel('User')
    const user = await User.objects.get({ id: 1 })
    user.name = 'Test Runner 2'
    await user.save()
    expect(await User.objects.filter({ id: 1 }).first()).toEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Test Runner 2',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      })
    )
  })

  it('reloads user values', async () => {
    const User = getModel('User')
    const user = new User({ id: 1 })
    await user.reload()
    expect(user).toEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      })
    )
  })

  it('counts users', async () => {
    expect(await getModel('User').objects.count()).toBe(4)
  })

  it('creates user with predefined primary key', async () => {
    const User = getModel('User')
    const user = new User({
      createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
      id: 42,
      name: 'Elzar Jetpack',
      email: 'elzar@gmail.com',
      superuser: false,
      inactive: false
    })
    await user.save()
    expect(await User.objects.all()).toContainEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 42,
        name: 'Elzar Jetpack',
        email: 'elzar@gmail.com',
        superuser: false,
        inactive: false
      })
    )
  })

  it('updates existing user with predefined primary key', async () => {
    const User = getModel('User')
    const user = new User({
      createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
      id: 1,
      name: 'Elzar Jetpack',
      email: 'elzar@gmail.com',
      superuser: false,
      inactive: false
    })
    await user.save()
    expect(await User.objects.all()).toContainEqual(
      new User({
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Elzar Jetpack',
        email: 'elzar@gmail.com',
        superuser: false,
        inactive: false
      })
    )
  })
}

const setupSuite = () => {
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

  setupTests()
}

module.exports = { setupSuite }
