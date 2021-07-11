const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')
const { Readable, pipeline } = require('stream')
const { TargetStream } = require('__mocks__/TargetStream')

const promisePipeline = (...args) =>
  new Promise((resolve, reject) =>
    pipeline(...args, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  )

const getSource = data =>
  new Readable({
    objectMode: true,
    read () {
      this.push(data.shift() || null)
    }
  })

const getDest = () => new TargetStream()

const setupModels = () => {
  const models = {}
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
    }

    User.register()
    models.User = User
  })
  return models
}

const setupTests = models => {
  it('stores all records', async () => {
    const User = getModel('User')
    const records = [
      {
        createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      },
      {
        createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      },
      {
        createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
        id: 3,
        name: 'Neil Henry',
        email: 'neil.henry@iol.com',
        superuser: false,
        inactive: true
      },
      {
        createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      }
    ]

    const src = getSource(records)
    const dest = User.objects.createWriteStream()
    await promisePipeline(src, dest)
    expect(await User.objects.all()).toEqual(
      expect.arrayContaining([
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
    )
  })

  it('stores all records given they are already instances', async () => {
    const User = getModel('User')
    const records = [
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
    ]

    const src = getSource(records)
    const dest = User.objects.createWriteStream()
    await promisePipeline(src, dest)
    expect(await User.objects.all()).toEqual(
      expect.arrayContaining([
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
    )
  })

  it('stores all records given input is structured as chunks', async () => {
    const User = getModel('User')
    const records = [
      [
        {
          createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
          id: 1,
          name: 'Harmony Vasquez',
          email: 'harmony.vasquez@gmail.com',
          superuser: false,
          inactive: false
        },
        {
          createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
          id: 2,
          name: 'Jasper Fraley',
          email: 'jasper.fraley@seznam.cz',
          superuser: true,
          inactive: false
        }
      ],
      [
        {
          createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
          id: 3,
          name: 'Neil Henry',
          email: 'neil.henry@iol.com',
          superuser: false,
          inactive: true
        },
        {
          createdAt: new Date(Date.UTC(2020, 0, 1, 23, 23, 23)),
          id: 4,
          name: 'Merver Chin',
          email: 'merver.chin@gmail.com',
          superuser: true,
          inactive: false
        }
      ]
    ]

    const src = getSource(records)
    const dest = User.objects.createWriteStream()
    await promisePipeline(src, dest)
    expect(await User.objects.all()).toEqual(
      expect.arrayContaining([
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
    )
  })

  it('reads all records', async () => {
    const User = getModel('User')
    await User.from({
      createdAt: new Date(Date.UTC(2020, 0, 1, 20, 20, 20)),
      id: 1,
      name: 'Harmony Vasquez',
      email: 'harmony.vasquez@gmail.com',
      superuser: false,
      inactive: false
    }).save()
    await User.from({
      createdAt: new Date(Date.UTC(2020, 0, 1, 21, 21, 21)),
      id: 2,
      name: 'Jasper Fraley',
      email: 'jasper.fraley@seznam.cz',
      superuser: true,
      inactive: false
    }).save()
    await User.from({
      createdAt: new Date(Date.UTC(2020, 0, 1, 22, 22, 22)),
      id: 3,
      name: 'Neil Henry',
      email: 'neil.henry@iol.com',
      superuser: false,
      inactive: true
    }).save()

    const src = User.objects.stream()
    const dest = getDest()
    await promisePipeline(src, dest)
    expect(dest.data).toEqual(
      expect.arrayContaining([
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
        })
      ])
    )
  })
}

const setupSuite = () => {
  beforeEach(() => {
    advanceTo(new Date(Date.UTC(2021, 4, 25, 0, 0, 0)))
  })

  const models = setupModels()

  beforeEach(init)

  afterEach(shutdown)

  afterEach(async () => {
    clearModels()
    clear()
  })

  setupTests(models)
}

module.exports = { setupSuite }
