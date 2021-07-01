const { clearModels, getModel } = require('../../models/ModelRegistry')
const { DatabaseModel } = require('../../models/DatabaseModel')
const { ForeignKey } = require('../ForeignKey')
const { CharField } = require('../CharField')
const { PositiveIntegerField } = require('../PositiveIntegerField')
const { ValueError } = require('../../errors')

describe('ForeignKey', () => {
  beforeEach(() => {
    class TestReferenceModel extends DatabaseModel {
      static id = new PositiveIntegerField()
      static dummyName = new CharField()
    }

    class TestModel extends DatabaseModel {
      static id = new PositiveIntegerField()
      static testField = new ForeignKey({
        model: 'TestReferenceModel'
      })
    }

    TestReferenceModel.register()
    TestModel.register()
  })

  afterEach(clearModels)

  it('accepts null', () => {
    const TestModel = getModel('TestModel')
    const instance = new TestModel({
      testField: null
    })
    expect(instance.testField).toEqual(null)
  })

  it('reuses model instance', () => {
    const TestModel = getModel('TestModel')
    const TestReferenceModel = getModel('TestReferenceModel')
    const inst = new TestReferenceModel({
      dummyName: 'test-object'
    })
    const instance = new TestModel({
      testField: inst
    })
    expect(instance.testField).toBe(inst)
  })

  it('accepts object', () => {
    const TestModel = getModel('TestModel')
    const TestReferenceModel = getModel('TestReferenceModel')
    const instance = new TestModel({
      testField: {
        dummyName: 'test-object'
      }
    })
    expect(instance.testField).toEqual(
      new TestReferenceModel({
        dummyName: 'test-object'
      })
    )
  })

  it('rejects number', () => {
    const TestModel = getModel('TestModel')
    expect(() => {
      // eslint-disable-next-line
      new TestModel({
        testField: 616
      })
    }).toThrow(ValueError)
  })
})
