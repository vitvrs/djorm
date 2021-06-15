const fields = require('djorm/fields')

const { advanceTo, clear } = require('jest-date-mock')
const { init, shutdown } = require('djorm/config')
const { DatabaseModel, clearModels, getModel } = require('djorm/models')
const { RecordIsReferenced } = require('djorm/db/errors')

const setupModels = () => {
  beforeEach(() => {
    class Job extends DatabaseModel {
      static id = new fields.PositiveIntegerField()
      static checksum = new fields.CharField()
      static live = new fields.BooleanField()
      static props = new fields.JsonField()
    }

    Job.register()
  })
}

const setupTests = ({ testForeignKeys }) => {
  it('json field is stored with json object', async () => {
    const Job = getModel('Job')
    const job = new Job({
      checksum: 'this-should-be-a-checksum',
      live: true,
      props: {
        someObjectId: 94858395,
        someLink: 'https://example.com'
      }
    })
    await job.save()
    const result = await Job.objects.get({
      checksum: 'this-should-be-a-checksum'
    })
    expect(result).toMatchObject({
      checksum: 'this-should-be-a-checksum',
      live: true,
      props: {
        someObjectId: 94858395,
        someLink: 'https://example.com'
      }
    })
  })
}

const setupSuite = ({ testForeignKeys = true } = {}) => {
  beforeEach(() => {
    advanceTo(new Date(Date.UTC(2021, 4, 25, 0, 0, 0)))
  })

  setupModels()

  beforeEach(init)

  afterEach(shutdown)

  afterEach(async () => {
    clearModels()
    clear()
  })

  setupTests({ testForeignKeys })
}

module.exports = { setupSuite }
