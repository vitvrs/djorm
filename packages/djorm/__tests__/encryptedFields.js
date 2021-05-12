const app = require('../__samples__/encrypted-fields-app')

describe('env config with sqlite', () => {
  beforeEach(app.initialize)

  afterEach(app.shutdown)

  it('password field stores hashed value', async () => {
    const user = new app.User({
      name: 'Jon',
      password: app.User.password.getPasswordHash('4151^xiw)fd4fz@!')
    })
    await user.save()
    expect(user.password).toBe(
      'ca66345c3eb5a0d74dacdf733a61f6ebf9bf349b1cac80aeda8fe76683dcf1af'
    )
  })

  it('encrypted text field stores encrypted value', async () => {
    const user = new app.User({
      name: 'Jon',
      password: app.User.password.getPasswordHash('4151^xiw)fd4fz@!'),
      privateKey: '4151^xiw)fd4fz@!'
    })
    await user.save()
    expect(
      await app.User.db.query(`SELECT * FROM user WHERE id = ${user.id}`)
    ).toEqual([
      expect.objectContaining({
        privateKey:
          'aes256:762a74705f7223663534667a24387724:2fc3ef78c58406b84ca74219c3a751b54c9feb1d8dd3ebab24a8b99195e7d8db'
      })
    ])
  })

  it('retrieve decrypted value', async () => {
    expect(await app.User.objects.get({ id: 2 })).toEqual(
      expect.objectContaining({
        privateKey: '4151^xiw)fd4fz@!'
      })
    )
  })
})
