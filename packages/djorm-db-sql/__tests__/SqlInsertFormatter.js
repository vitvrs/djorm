const { SqlFormatter } = require('..')
const { Insert } = require('djorm/db')

describe('SqlInsertFormatter', () => {
  let driver

  beforeEach(() => {
    driver = new SqlFormatter()
  })

  it('formats insert query', () => {
    const qs = new Insert().into('users').values({
      name: 'Jasper Fraley',
      email: 'jasper.fraley@seznam.cz',
      superuser: true,
      inactive: false
    })
    expect(driver.formatQuery(qs)).toBe(
      [
        'INSERT INTO `users`',
        '(`name`,`email`,`superuser`,`inactive`)',
        "VALUES ('Jasper Fraley','jasper.fraley@seznam.cz',1,0)"
      ].join(' ')
    )
  })
})
