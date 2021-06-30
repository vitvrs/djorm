const { configure } = require('djorm/config')
const { promises } = require('fs')

const tmp = require('tmp-promise')

const setupDb = dbPath => {
  const config = {}

  beforeEach(async () => {
    config.tmpFile = await tmp.file()
    await promises.copyFile(dbPath, config.tmpFile.path)
    configure({
      databases: {
        default: {
          driver: 'djorm-db-sqlite',
          path: config.tmpFile.path
        }
      }
    })
  })

  afterEach(async () => {
    await config.tmpFile.cleanup()
  })

  return config
}

module.exports = { setupDb }
