const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')

const setupModels = () => {
  const models = {}
  beforeEach(() => {
    class UserKey extends DatabaseModel {
      static privateToken = new fields.CharField()
      static publicToken = new fields.CharField()

      static meta = {
        modelName: 'UserKey'
      }
    }

    class User extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static name = new fields.CharField()
      static frontendConfig = new fields.JsonField()
      static personalKey = new fields.ObjectField({
        model: UserKey
      })

      static meta = class {
        static modelName = 'User'
      }
    }

    User.register()
    models.User = User
    models.UserKey = UserKey
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
