const { AttrModel } = require('../../models/AttrModel')
const { JsonField } = require('../JsonField')
const { ValueError } = require('../../errors')

describe('JsonField', () => {
  class TestModel extends AttrModel {
    static testField = new JsonField()
  }

  it('accepts null', () => {
    const instance = new TestModel({
      testField: null
    })
    expect(instance.testField).toEqual(null)
  })

  it('accepts object', () => {
    const instance = new TestModel({
      testField: {
        this: {
          is: {
            a: 'test-object'
          }
        }
      }
    })
    expect(instance.testField).toEqual({
      this: {
        is: {
          a: 'test-object'
        }
      }
    })
  })

  it('accepts string', () => {
    const instance = new TestModel({
      testField: '{"this":{"is":{"a":"test-object"}}}'
    })
    expect(instance.testField).toEqual({
      this: {
        is: {
          a: 'test-object'
        }
      }
    })
  })

  it('throws value error on invalid date', () => {
    expect(
      () =>
        new TestModel({
          testField: 'gibberish'
        })
    ).toThrow(ValueError)
  })
})
