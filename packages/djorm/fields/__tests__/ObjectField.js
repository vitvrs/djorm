const { DatabaseModel } = require('../../models/DatabaseModel')
const { CharField } = require('../CharField')
const { DateField } = require('../DateField')
const { ObjectField } = require('../ObjectField')
const { ModelError, ValueError } = require('../../errors')

describe('ObjectField', () => {
  class PassedModel extends DatabaseModel {
    static firstName = new CharField()
    static lastName = new CharField()
    static birth = new DateField({ null: true })
  }

  class TestModel extends DatabaseModel {
    static testField = new ObjectField({
      model: PassedModel
    })
  }

  it('accepts null', () => {
    const instance = new TestModel({
      testField: null
    })
    expect(instance.testField).toEqual(null)
  })

  it('throws given model is null', () => {
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class Foo {
        static testField = new ObjectField()
      }
    }).toThrow(ModelError)
  })

  it('throws given passed value is not instance of specified class', () => {
    class BadClass extends DatabaseModel {
      static thisIsNot = new CharField()
    }
    expect(() => {
      // eslint-disable-next-line no-new
      new TestModel({
        testField: new BadClass({
          thisIsNot: 'theClassYouAreLookingFor'
        })
      })
    }).toThrow(ValueError)
  })

  it('resolves instance from plain object', () => {
    const instance = new TestModel({
      testField: {
        firstName: 'Foo',
        lastName: 'bar'
      }
    })
    expect(instance.testField).toBeInstanceOf(PassedModel)
  })

  it('stores as JSON in db given value is truthy', () => {
    expect(
      TestModel.testField.toDb(
        new PassedModel({
          firstName: 'Foo',
          lastName: 'bar'
        })
      )
    ).toBe('{"firstName":"Foo","lastName":"bar","birth":null}')
  })

  it('stores as null in db given value is falsy', () => {
    expect(TestModel.testField.toDb(undefined)).toBe(null)
  })

  it('serializes as plain object given value is truthy', () => {
    expect(
      TestModel.testField.serialize(
        new PassedModel({
          firstName: 'Foo',
          lastName: 'bar'
        })
      )
    ).toEqual({
      firstName: 'Foo',
      lastName: 'bar',
      birth: null
    })
  })

  it('serializes as null given value is falsy', () => {
    expect(TestModel.testField.serialize(undefined)).toBe(null)
  })
})
