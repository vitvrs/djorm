const { SqlFormatter } = require('..')
const { Delete } = require('djorm/db')

describe('SqlDeleteFormatter', () => {
  let driver

  beforeEach(() => {
    driver = new SqlFormatter()
  })

  it('formats delete query', () => {
    const qs = new Delete().target('users').filter({
      id: 1
    })
    expect(driver.formatQuery(qs)).toBe(
      ['DELETE FROM `users`', 'WHERE `users`.`id` = 1'].join(' ')
    )
  })
})
