const pool = require('djorm/db/DatabasePool')
const fields = require('djorm/fields')

const { DatabaseModel } = require('djorm/models')
const { setupDb } = require('../__samples__/setup')

describe('mysql select with users-trivial', () => {
  let models

  setupDb('users-trivial.sql')

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
    ).toEqual({
      id: 5,
      name: 'Test Runner',
      email: 'test.runner@gmail.com',
      superuser: false,
      inactive: false
    })
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
