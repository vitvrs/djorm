const { SqlFormatter } = require('..')
const { Update } = require('djorm/db')

describe('SqlUpdateFormatter', () => {
  let driver

  beforeEach(() => {
    driver = new SqlFormatter()
  })

  it('formats update query', () => {
    const qs = new Update()
      .target('users')
      .values({
        name: 'Jasper Fraley',
        email: 'jasper.fraley@seznam.cz',
        superuser: true,
        inactive: false
      })
      .filter({
        id: 1
      })
    expect(driver.formatQuery(qs)).toBe(
      [
        'UPDATE `users`',
        'SET',
        "`name` = 'Jasper Fraley',",
        "`email` = 'jasper.fraley@seznam.cz',",
        '`superuser` = 1,',
        '`inactive` = 0',
        'WHERE `users`.`id` = 1'
      ].join(' ')
    )
  })
})
