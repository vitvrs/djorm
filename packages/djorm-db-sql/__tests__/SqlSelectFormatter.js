const { SqlFormatter } = require('..')
const { DatabaseModel } = require('djorm/models')
const { CharField, PositiveIntegerField } = require('djorm/fields')
const {
  And,
  Q,
  QueryAllRecords,
  QueryColumn,
  QueryFormatterError,
  QueryFunc,
  QueryJoin,
  Select,
  Or
} = require('djorm/db')

describe('SqlSelectFormatter', () => {
  let driver

  beforeEach(() => {
    driver = new SqlFormatter()
  })

  class User extends DatabaseModel {
    static id = new PositiveIntegerField()
    static name = new CharField()
    static role = new CharField()
    static table = 'users'
    static meta = class {
      static modelName = 'User'
    }
  }

  it('throws given query does not inherit Query', () => {
    expect(() => driver.formatQuery(new (class Foo {})())).toThrow(
      QueryFormatterError
    )
  })

  describe('formatQuery with select', () => {
    it('formats query', () => {
      const qs = new Select().from('users').select('id', 'name')
      expect(driver.formatQuery(qs)).toBe('SELECT `id`, `name` FROM `users`')
    })

    it('formats query with one "eq" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          role: 'admin'
        })
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `users`.`role` = 'admin'"
      )
    })

    it('formats query with one "eq" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          role: 'admin'
        })
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `users`.`role` != 'admin'"
      )
    })

    it('formats query with one "neq" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          role__neq: 'admin'
        })
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `users`.`role` != 'admin'"
      )
    })

    it('formats query with one "neq" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          role__neq: 'admin'
        })
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `users`.`role` = 'admin'"
      )
    })

    it('formats query with one "lt" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          age__lt: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` < 18'
      )
    })

    it('formats query with one "lt" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          age__lt: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` >= 18'
      )
    })

    it('formats query with one "lte" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          age__lte: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` <= 18'
      )
    })

    it('formats query with one "lte" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          age__lte: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` > 18'
      )
    })

    it('formats query with one "gt" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          age__gt: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` > 18'
      )
    })

    it('formats query with one "gt" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          age__gt: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` <= 18'
      )
    })

    it('formats query with one "gte" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          age__gte: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` >= 18'
      )
    })

    it('formats query with one "gte" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          age__gte: 18
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` < 18'
      )
    })

    it('formats query with one numeric "in" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          age__in: [15, 16, 17]
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` IN (15,16,17)'
      )
    })

    it('formats query with one string "in" filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter({
          role__in: ['admin', 'poweruser']
        })
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `users`.`role` IN ('admin','poweruser')"
      )
    })

    it('formats query with one "in" exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude({
          age__in: [15, 16, 17]
        })
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` WHERE `users`.`age` NOT IN (15,16,17)'
      )
    })

    it('formats query with "or" condition filter', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter(
          new Or({
            name: 'Honza',
            role: 'admin'
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE (`users`.`name` = 'Honza' OR `users`.`role` = 'admin')"
      )
    })

    it('formats query with "or" condition exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude(
          new Or({
            name: 'Honza',
            role: 'admin'
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        "SELECT `id`, `name` FROM `users` WHERE (`users`.`name` != 'Honza' AND `users`.`role` != 'admin')"
      )
    })

    it('formats query with "and"/"or" condition filters', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter(
          new Or({
            name: 'Honza',
            role: 'admin'
          })
        )
        .filter(
          new Or({
            name: 'Pavel',
            role: 'admin'
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT `id`, `name`',
          'FROM `users`',
          'WHERE',
          "(`users`.`name` = 'Honza' OR `users`.`role` = 'admin')",
          'AND',
          "(`users`.`name` = 'Pavel' OR `users`.`role` = 'admin')"
        ].join(' ')
      )
    })

    it('formats query with "and"/"or" condition excludes', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude(
          new Or({
            name: 'Honza',
            role: 'admin'
          })
        )
        .exclude(
          new Or({
            name: 'Pavel',
            role: 'admin'
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT `id`, `name`',
          'FROM `users`',
          'WHERE',
          "(`users`.`name` != 'Honza' AND `users`.`role` != 'admin')",
          'AND',
          "(`users`.`name` != 'Pavel' AND `users`.`role` != 'admin')"
        ].join(' ')
      )
    })

    it('formats query with "or"/"and" condition filters', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .filter(
          new Or(
            new And({
              name: 'Honza',
              role: 'admin'
            }),
            new And({
              name: 'Pavel',
              role: 'admin'
            })
          )
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT `id`, `name`',
          'FROM `users`',
          'WHERE',
          "((`users`.`name` = 'Honza' AND `users`.`role` = 'admin')",
          'OR',
          "(`users`.`name` = 'Pavel' AND `users`.`role` = 'admin'))"
        ].join(' ')
      )
    })

    it('formats query with "or"/"and" condition exclude', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .exclude(
          new Or(
            new And({
              name: 'Honza',
              role: 'admin'
            }),
            new And({
              name: 'Pavel',
              role: 'admin'
            })
          )
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT `id`, `name`',
          'FROM `users`',
          'WHERE',
          "((`users`.`name` != 'Honza' OR `users`.`role` != 'admin')",
          'AND',
          "(`users`.`name` != 'Pavel' OR `users`.`role` != 'admin'))"
        ].join(' ')
      )
    })

    it('formats query with one order directive', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .orderBy('age')
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` ORDER BY `users`.`age`'
      )
    })

    it('formats query with one inverse order directive', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .orderBy('-age')
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` ORDER BY `users`.`age` DESC'
      )
    })

    it('formats query with two order directives', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .orderBy('-age', 'name')
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` ORDER BY `users`.`age` DESC, `users`.`name`'
      )
    })

    it('formats query with limit directive', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .limit(20)
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` LIMIT 20'
      )
    })

    it('formats query with offset directive', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .offset(20)
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` OFFSET 20'
      )
    })

    it('formats query with limit and offset directive', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .limit(20)
        .offset(20)
      expect(driver.formatQuery(qs)).toBe(
        'SELECT `id`, `name` FROM `users` LIMIT 20 OFFSET 20'
      )
    })

    it('formats query with one join', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .join(
          new QueryJoin({
            name: 'roles',
            alias: 'roles',
            conditions: new Q({ roleId: new QueryColumn('roles__id') })
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`id`, `name` FROM `users`',
          'INNER JOIN `roles` AS `roles` ON (`users`.`roleId` = `roles`.`id`)'
        ].join(' ')
      )
    })

    it('formats query with one left join', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .join(
          new QueryJoin({
            name: 'roles',
            alias: 'roles',
            side: QueryJoin.left,
            conditions: new Q({ roleId: new QueryColumn('roles__id') })
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`id`, `name` FROM `users`',
          'LEFT JOIN `roles` AS `roles` ON (`users`.`roleId` = `roles`.`id`)'
        ].join(' ')
      )
    })

    it('formats query with one right join', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name')
        .join(
          new QueryJoin({
            name: 'roles',
            alias: 'roles',
            side: QueryJoin.right,
            conditions: new Q({ roleId: new QueryColumn('roles__id') })
          })
        )

      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`id`, `name` FROM `users`',
          'RIGHT JOIN `roles` AS `roles` ON (`users`.`roleId` = `roles`.`id`)'
        ].join(' ')
      )
    })

    it('formats query with two joins', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name', 'roles__name', 'roles__id')
        .join(
          new QueryJoin({
            name: 'user_roles',
            alias: 'user_roles',
            conditions: new Q({ id: new QueryColumn('user_roles__userId') })
          })
        )
        .join(
          new QueryJoin({
            name: 'roles',
            alias: 'roles',
            conditions: new Q({
              user_roles__roleId: new QueryColumn('roles__id')
            })
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`id`, `name`, `roles`.`name` AS `roles__name`, `roles`.`id` AS `roles__id` FROM `users`',
          'INNER JOIN `user_roles` AS `user_roles` ON (`users`.`id` = `user_roles`.`userId`)',
          'INNER JOIN `roles` AS `roles` ON (`user_roles`.`roleId` = `roles`.`id`)'
        ].join(' ')
      )
    })

    it('formats query with self join', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'lookalikeIndex', 'lookalike__lookalikeIndex')
        .join(
          new QueryJoin({
            name: 'users',
            alias: 'lookalike',
            side: QueryJoin.left,
            conditions: {
              lookalikeIndex: new QueryColumn('lookalike__lookalikeIndex')
            }
          })
        )
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`id`, `lookalikeIndex`, `lookalike`.`lookalikeIndex` AS `lookalike__lookalikeIndex`',
          'FROM `users`',
          'LEFT JOIN `users` AS `lookalike` ON (`users`.`lookalikeIndex` = `lookalike`.`lookalikeIndex`)'
        ].join(' ')
      )
    })

    it('throws given query has two joins to same table without alias', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name', 'roles__name', 'roles__id')
        .join(
          new QueryJoin({
            name: 'user_roles',
            conditions: new Q({ id: new QueryColumn('user_roles__userId') })
          })
        )
        .join(
          'user_roles',
          new Q({ id: new QueryColumn('user_roles__userId') })
        )
      expect(() => driver.formatQuery(qs)).toThrow(QueryFormatterError)
    })

    it('throws given query joins base table without alias', () => {
      const qs = new Select()
        .from('users')
        .select('id', 'name', 'roles__name', 'roles__id')
        .join(
          new QueryJoin({
            name: 'users',
            conditions: { lookalike: new QueryColumn('lookalike') }
          })
        )
      expect(() => driver.formatQuery(qs)).toThrow(QueryFormatterError)
    })

    it('formats select with model', () => {
      const qs = new Select().from(User).filter({ role: 'admin' })
      expect(driver.formatQuery(qs)).toBe(
        [
          'SELECT',
          '`users`.`id` AS `User__id`,',
          '`users`.`name` AS `User__name`,',
          '`users`.`role` AS `User__role`',
          "FROM `users` WHERE `users`.`role` = 'admin'"
        ].join(' ')
      )
    })

    it('formats count query', () => {
      const qs = new Select().from('users').select(
        new QueryFunc({
          name: 'COUNT',
          args: [new QueryAllRecords()],
          alias: 'cnt'
        })
      )
      expect(driver.formatQuery(qs)).toBe(
        'SELECT COUNT(*) AS `cnt` FROM `users`'
      )
    })
  })
})
