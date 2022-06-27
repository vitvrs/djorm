const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')

const setupModels = () => {
  const models = {}
  beforeEach(() => {
    class LookupTable extends DatabaseModel {
      static id = new fields.AutoField()
      static inputVariable = new fields.CharField()
      static weight = new fields.PositiveIntegerField()
    }

    class UserLookupTable extends LookupTable {
      static user = new fields.ForeignKey({ model: 'User' })
    }

    class UserKey extends DatabaseModel {
      static privateToken = new fields.CharField()
      static publicToken = new fields.CharField()

      static meta = {
        modelName: 'UserKey'
      }
    }

    class User extends DatabaseModel {
      static id = new fields.AutoField()
      static name = new fields.CharField()
      static frontendConfig = new fields.JsonField({ null: true })
      static personalKey = new fields.ObjectField({
        model: UserKey,
        null: true
      })

      static meta = class {
        static modelName = 'User'
      }
    }

    User.register()
    UserLookupTable.register()
    LookupTable.register()
    models.LookupTable = LookupTable
    models.UserKey = UserKey
    models.UserLookupTable = UserLookupTable
    models.User = User
  })
  return models
}

const setupTests = models => {
  it('stores personal key object', async () => {
    const User = getModel('User')
    const user = new User({
      name: 'Elzar Jetpack',
      personalKey: {
        privateToken: 'foo',
        publicToken: 'bar'
      }
    })
    await user.save()
    expect(await User.objects.get({ name: 'Elzar Jetpack' })).toHaveProperty(
      'personalKey',
      models.UserKey.from({
        privateToken: 'foo',
        publicToken: 'bar'
      })
    )
  })

  it('stores json field value', async () => {
    const User = getModel('User')
    const user = new User({
      name: 'Elzar Jetpack',
      frontendConfig: {
        displayIntro: false
      }
    })
    await user.save()
    expect(await User.objects.get({ name: 'Elzar Jetpack' })).toHaveProperty(
      'frontendConfig',
      {
        displayIntro: false
      }
    )
  })

  it('stores json field stringified value', async () => {
    const User = getModel('User')
    const user = new User({
      name: 'Elzar Jetpack',
      frontendConfig: JSON.stringify({
        displayIntro: false
      })
    })
    await user.save()
    expect(await User.objects.get({ name: 'Elzar Jetpack' })).toHaveProperty(
      'frontendConfig',
      {
        displayIntro: false
      }
    )
  })

  it('stores json field value with evil values', async () => {
    const User = getModel('User')
    const user = new User({
      name: 'Elzar Jetpack',
      frontendConfig: {
        customGreeting: 'This is Tom\'s "dashboard"',
        customFooter: '\\\\\\\\'
      }
    })
    await user.save()
    expect(await User.objects.get({ name: 'Elzar Jetpack' })).toHaveProperty(
      'frontendConfig',
      {
        customGreeting: 'This is Tom\'s "dashboard"',
        customFooter: '\\\\\\\\'
      }
    )
  })

  it('stores nested class instance IDs', async () => {
    const User = getModel('User')
    const UserLookupTable = getModel('UserLookupTable')
    await User.from({
      id: 101,
      name: 'Elzar Jetpack'
    }).save()
    await UserLookupTable.from({
      inputVariable: 'name',
      userId: 101,
      weight: 1
    }).save()
    expect(await UserLookupTable.objects.all()).toContainEqual(
      expect.objectContaining({
        inputVariable: 'name',
        userId: 101,
        weight: 1
      })
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
