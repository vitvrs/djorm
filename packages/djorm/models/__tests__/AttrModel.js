const { AttrModel } = require('../AttrModel')
const { CharField, DateField } = require('../../fields')

describe('AttrModel', () => {
  it('toJson filters out private values', () => {
    class User extends AttrModel {
      static name = new CharField()
      static password = new CharField({ private: true })
      static dateOfBirth = new DateField()
    }
    const user = new User({
      name: 'Jon',
      password: '0fb08',
      dateOfBirth: new Date(Date.UTC(1994, 6, 22))
    })
    expect(user.toJson()).toEqual({
      name: 'Jon',
      dateOfBirth: '1994-07-22'
    })
  })

  it('toJson includes serialized values given includePrivate is true', () => {
    class User extends AttrModel {
      static name = new CharField()
      static password = new CharField({ private: true })
      static dateOfBirth = new DateField()
    }
    const user = new User({
      name: 'Jon',
      password: '0fb08',
      dateOfBirth: '1994-07-22'
    })
    expect(user.toJson(true)).toEqual({
      name: 'Jon',
      password: '0fb08',
      dateOfBirth: '1994-07-22'
    })
  })
})
