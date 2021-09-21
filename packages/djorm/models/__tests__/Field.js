const { AttrModel, Field } = require('..')
const { FieldValidationError } = require('../../errors')

describe('Field model', () => {
  it('validate accepts null value on null field', async () => {
    class TestClass extends AttrModel {
      static testField = new Field({ null: true })
    }
    const inst = new TestClass({ testField: null })
    await expect(inst.validate()).resolves.toBe(undefined)
  })

  it('validate rejects null value on non-null field with FieldValidationError', async () => {
    class TestClass extends AttrModel {
      static testField = new Field({ null: false })
    }
    const inst = new TestClass({ testField: null })
    await expect(inst.validate()).rejects.toBeInstanceOf(FieldValidationError)
  })
})
