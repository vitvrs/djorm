const app = require('../__samples__/trivial-app')

describe('env config with sqlite', () => {
  beforeEach(app.initialize)

  afterEach(app.shutdown)

  it('retrieves users from database', async () => {
    const items = await app.User.objects.all()
    expect(items).toEqual([
      new app.User({
        id: 1,
        name: 'Harmony Vasquez',
        email: 'harmony.vasquez@gmail.com',
        superuser: false,
        inactive: false
      }),
      new app.User({
        id: 2,
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      }),
      new app.User({
        id: 3,
        name: 'Neil Henry',
        email: 'neil.henry@iol.com',
        superuser: false,
        inactive: true
      }),
      new app.User({
        id: 4,
        name: 'Merver Chin',
        email: 'merver.chin@gmail.com',
        superuser: true,
        inactive: false
      })
    ])
  })
})
