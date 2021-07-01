const { DatabaseModel } = require('../DatabaseModel')
const { PositiveIntegerField, CharField, TextField } = require('../../fields')

describe('DatabaseModel', () => {
  it('class toString returns model name', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
    }
    expect(String(User)).toBe('User')
  })

  it('class toString returns meta model name', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
      static name = new CharField()

      static meta = class {
        static modelName = 'User'
      }
    }
    expect(String(User)).toBe('User')
  })

  it('instance toString returns model name with new tag', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
    }
    expect(String(User.from({}))).toEqual('User#(new)')
  })

  it('instance toString returns model name with pk value', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
    }
    expect(
      String(
        User.from({
          id: 666
        })
      )
    ).toEqual('User#666')
  })

  it('instance toString returns meta model name with pk value', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
      static name = new CharField()
      static password = new TextField({ encrypted: true })

      static meta = class {
        static modelName = 'User'
      }
    }
    expect(
      String(
        User.from({
          id: 666,
          name: 'John',
          password:
            'aes256:646a6f726d2d7365637265742d6b6579:7cf8aef56dc2df2dd3f9b80bdbff87ff'
        })
      )
    ).toEqual('User#666')
  })

  it('instance toString returns meta model name with new tag', () => {
    class User extends DatabaseModel {
      static id = new PositiveIntegerField()
      static name = new CharField()
      static password = new TextField({ encrypted: true })

      static meta = class {
        static modelName = 'User'
      }
    }
    expect(
      String(
        User.from({
          name: 'John',
          password:
            'aes256:646a6f726d2d7365637265742d6b6579:7cf8aef56dc2df2dd3f9b80bdbff87ff'
        })
      )
    ).toEqual('User#(new)')
  })
})
