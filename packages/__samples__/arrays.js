const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { init, shutdown } = require('djorm/config')
const { FieldValidationError } = require('djorm/errors')

const setupModels = () => {
  const models = {}
  beforeEach(() => {
    class IntArrayModel extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static arrayField = new fields.ArrayField({
        baseField: new fields.PositiveIntegerField()
      })
    }

    class StringArrayModel extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static arrayField = new fields.ArrayField({
        baseField: new fields.CharField()
      })
    }

    class NullIntArrayModel extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static arrayField = new fields.ArrayField({
        baseField: new fields.PositiveIntegerField({ null: true }),
        null: true
      })
    }

    class NullStringArrayModel extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static arrayField = new fields.ArrayField({
        baseField: new fields.CharField({ null: true }),
        null: true
      })
    }

    IntArrayModel.register()
    StringArrayModel.register()
    NullIntArrayModel.register()
    NullStringArrayModel.register()
    models.IntArrayModel = IntArrayModel
    models.StringArrayModel = StringArrayModel
    models.NullIntArrayModel = NullIntArrayModel
    models.NullStringArrayModel = NullStringArrayModel
  })
  return models
}

const setupTests = models => {
  it('stores int array in integer array field', async () => {
    const IntArrayModel = getModel('IntArrayModel')
    await IntArrayModel.create({
      id: 1,
      arrayField: ['1', 2, 3]
    })
    expect(await IntArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      [1, 2, 3]
    )
  })

  it('rejects int array with nulls in non-nullable integer array field', async () => {
    const IntArrayModel = getModel('IntArrayModel')
    await expect(
      IntArrayModel.create({
        id: 1,
        arrayField: ['1', null, 3]
      })
    ).rejects.toBeInstanceOf(FieldValidationError)
  })

  it('stores string array in string array field', async () => {
    const StringArrayModel = getModel('StringArrayModel')
    await StringArrayModel.create({
      id: 1,
      arrayField: ['1', 2, 3]
    })
    expect(await StringArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      ['1', '2', '3']
    )
  })

  it('rejects string array with nulls in non-nullable string array field', async () => {
    const StringArrayModel = getModel('StringArrayModel')
    await expect(
      StringArrayModel.create({
        id: 1,
        arrayField: ['1', null, 3]
      })
    ).rejects.toBeInstanceOf(FieldValidationError)
  })

  it('stores int array in nullable integer array field', async () => {
    const NullIntArrayModel = getModel('NullIntArrayModel')
    await NullIntArrayModel.create({
      id: 1,
      arrayField: ['1', 2, 3]
    })
    expect(await NullIntArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      [1, 2, 3]
    )
  })

  it('stores int array with nulls in nullable integer array field', async () => {
    const NullIntArrayModel = getModel('NullIntArrayModel')
    await NullIntArrayModel.create({
      id: 1,
      arrayField: ['1', null, 3]
    })
    expect(await NullIntArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      [1, null, 3]
    )
  })

  it('stores string array in nullable string array field', async () => {
    const NullStringArrayModel = getModel('NullStringArrayModel')
    await NullStringArrayModel.create({
      id: 1,
      arrayField: ['1', 2, 3]
    })
    expect(await NullStringArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      ['1', '2', '3']
    )
  })

  it('stores string array with nulls in nullable string array field', async () => {
    const NullStringArrayModel = getModel('NullStringArrayModel')
    await NullStringArrayModel.create({
      id: 1,
      arrayField: ['1', null, 3]
    })
    expect(await NullStringArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      ['1', null, '3']
    )
  })

  it('stores null in nullable integer field', async () => {
    const NullIntArrayModel = getModel('NullIntArrayModel')
    await NullIntArrayModel.create({
      id: 1,
      arrayField: null
    })
    expect(await NullIntArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      null
    )
  })

  it('stores null in nullable string field', async () => {
    const NullStringArrayModel = getModel('NullStringArrayModel')
    await NullStringArrayModel.create({
      id: 1,
      arrayField: null
    })
    expect(await NullStringArrayModel.objects.get({ id: 1 })).toHaveProperty(
      'arrayField',
      null
    )
  })
}

const setupSuite = () => {
  beforeEach(() => {
    advanceTo(new Date(Date.UTC(2021, 4, 25, 0, 0, 0)))
  })

  const models = setupModels()

  beforeEach(init)

  afterEach(shutdown)

  afterEach(async () => {
    clearModels()
    clear()
  })

  setupTests(models)
}

module.exports = { setupSuite }
