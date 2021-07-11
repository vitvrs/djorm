const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')

const setupModels = () => {
  let models = {}
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
