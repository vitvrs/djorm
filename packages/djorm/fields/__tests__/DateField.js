const { AttrModel } = require('../../models/AttrModel')
const { DateField } = require('../DateField')
const { ValueError } = require('../../errors')

describe('DateField', () => {
  class TestModel extends AttrModel {
    static testField = new DateField({ null: true })
  }

  it('accepts null value', () => {
    const instance = new TestModel({
      testField: null
    })
    expect(instance.testField).toEqual(null)
  })

  it('accepts ISO date string', () => {
    const instance = new TestModel({
      testField: '2021-05-24'
    })
    expect(instance.testField).toEqual(new Date(Date.UTC(2021, 4, 24)))
  })

  it('accepts date object', () => {
    const instance = new TestModel({
      testField: new Date(Date.UTC(2021, 4, 24))
    })
    expect(instance.testField).toEqual(new Date(Date.UTC(2021, 4, 24)))
  })

  it('accepts number', () => {
    const instance = new TestModel({
      testField: Date.UTC(2021, 4, 24)
    })
    expect(instance.testField).toEqual(new Date(Date.UTC(2021, 4, 24)))
  })

  it('serializes value as an ISO-8601 partial date string', () => {
    expect(
      TestModel.testField.serialize(new Date(Date.UTC(2021, 4, 24)))
    ).toEqual('2021-05-24')
  })

  it('serializes `undefined` as a `null`', () => {
    expect(TestModel.testField.serialize(undefined)).toEqual(null)
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
