const { AttrModel } = require('../../models/AttrModel')
const { DateField } = require('../DateField')
const { ValueError } = require('../../errors')

describe('DateField', () => {
  class TestModel extends AttrModel {
    static testField = new DateField()
  }

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

  it('throws value error on invalid date', () => {
    expect(
      () =>
        new TestModel({
          testField: 'gibberish'
        })
    ).toThrow(ValueError)
  })
})
