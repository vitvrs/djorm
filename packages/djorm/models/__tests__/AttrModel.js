const { AttrModel } = require('../AttrModel')
const { CharField, DateTimeField } = require('../../fields')

describe('AttrModel', () => {
  it('serializeValues filters out private values', () => {
    class User extends AttrModel {
      static name = new CharField()
      static password = new CharField({ private: true })
      static dateOfBirth = new DateTimeField()
    }
    const user = new User({
      name: 'Jon',
      password: '0fb08',
      dateOfBirth: new Date(1994, 6, 22)
    })
    expect(user.serializeValues()).toEqual({
      name: 'Jon',
      dateOfBirth: new Date(1994, 6, 22)
    })
  })
})
