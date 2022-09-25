const app = require('__samples__/trivial-app')
const hub = require('../db')

describe('database connection', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('with trivial app', () => {
    beforeEach(app.initialize)

    afterEach(app.shutdown)

    it('disconnects after some time', async () => {
      await app.User.objects.all()
      expect(hub.get('default')).toHaveProperty('connected', true)
      await jest.runAllTimers()
      expect(hub.get('default')).toHaveProperty('connected', false)
    })
  })
})
