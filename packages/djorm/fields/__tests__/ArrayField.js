const { ArrayField, CharField, IntegerField } = require('..')
const { AttrModel } = require('../../models')
const { NestedValidationError, ValueError } = require('../../errors')

describe('ArrayField', () => {
  it('accepts null value given field is nullable', () => {
    class TestClass extends AttrModel {
      static testField = new ArrayField({
        baseField: new IntegerField(),
        null: true
      })
    }
    const inst = new TestClass({ testField: null })
    expect(inst.testField).toBe(null)
  })

  it('rejects null value given field is not nullable', async () => {
    class TestClass extends AttrModel {
      static testField = new ArrayField({
        baseField: new IntegerField(),
        null: false
      })
    }
    const inst = new TestClass({ testField: null })
    await expect(inst.validate()).rejects.toBeInstanceOf(NestedValidationError)
  })

  describe('with IntegerField base field', () => {
    class TestClass extends AttrModel {
      static testField = new ArrayField({
        baseField: new IntegerField()
      })
    }

    it('rejects number', () => {
      expect(() => new TestClass({ testField: 42 })).toThrow(ValueError)
    })

    it('rejects string', () => {
      expect(() => new TestClass({ testField: 'foo' })).toThrow(ValueError)
    })

    it('rejects object', () => {
      expect(() => new TestClass({ testField: { foo: 'bar' } })).toThrow(
        ValueError
      )
    })

    it('rejects array unparsable string', () => {
      expect(() => new TestClass({ testField: ['bar'] })).toThrow(ValueError)
    })

    it('rejects array containing object', () => {
      expect(() => new TestClass({ testField: [{ foo: 'bar' }] })).toThrow(
        ValueError
      )
    })

    it('accepts array of numbers', () => {
      const inst = new TestClass({ testField: [1, 2, 3] })
      expect(inst).toHaveProperty('testField', [1, 2, 3])
    })

    it('accepts array of mixed strings and numbers', () => {
      const inst = new TestClass({ testField: ['1', 2, '3'] })
      expect(inst).toHaveProperty('testField', [1, 2, 3])
    })
  })

  describe('with CharField base field', () => {
    class TestClass extends AttrModel {
      static testField = new ArrayField({
        baseField: new CharField()
      })
    }

    it('rejects number', () => {
      expect(() => new TestClass({ testField: 42 })).toThrow(ValueError)
    })

    it('rejects string', () => {
      expect(() => new TestClass({ testField: 'foo' })).toThrow(ValueError)
    })

    it('rejects object', () => {
      expect(() => new TestClass({ testField: { foo: 'bar' } })).toThrow(
        ValueError
      )
    })

    it('accepts array of numbers', () => {
      const inst = new TestClass({ testField: [1, 2, 3] })
      expect(inst).toHaveProperty('testField', ['1', '2', '3'])
    })

    it('accepts array of strings', () => {
      const inst = new TestClass({ testField: ['1', '2', '3'] })
      expect(inst).toHaveProperty('testField', ['1', '2', '3'])
    })

    it('accepts array of mixed strings and numbers', () => {
      const inst = new TestClass({ testField: ['1', 2, '3'] })
      expect(inst).toHaveProperty('testField', ['1', '2', '3'])
    })
  })
})
