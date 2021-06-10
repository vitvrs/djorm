const { configure } = require('djorm/config')
const { promises } = require('fs')

const tmp = require('tmp-promise')

const setupDb = dbPath => {
  let tmpFile

  beforeEach(async () => {
    tmpFile = await tmp.file()
    await promises.copyFile(dbPath, tmpFile.path)
    configure({
      databases: {
        default: {
          driver: 'djorm-db-sqlite',
          path: tmpFile.path
        }
      }
    })
  })

  afterEach(async () => {
    await tmpFile.cleanup()
  })
}

module.exports = { setupDb }
