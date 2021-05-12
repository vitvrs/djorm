/* istanbul ignore file */

const fields = require('djorm/fields')
const path = require('path')
const config = require('djorm/config')
const tmp = require('tmp-promise')

const { promises } = require('fs')
const { DatabaseModel } = require('djorm/models')

class User extends DatabaseModel {
  static id = new fields.PositiveIntegerField()
  static name = new fields.CharField()
  static password = new fields.PasswordField()
  static superuser = new fields.BooleanField()
  static inactive = new fields.BooleanField()
  static privateKey = new fields.TextField({ encrypted: true })

  static meta = class {
    static modelName = 'User'
  }
}

let tmpFile
const setupDb = async dbFile => {
  const dbPath = path.resolve(__dirname, dbFile)
  tmpFile = await tmp.file()
  await promises.copyFile(dbPath, tmpFile.path)
}

const initialize = async () => {
  await setupDb('db.sqlite')
  User.register()
  await config.init({
    secretKey: 'v*tp_r#f54fz$8w$ds(m=)o3mfl&zr92&gwx9qy)1wymudkp#4',
    databases: {
      default: {
        driver: 'djorm-db-sqlite',
        path: tmpFile.path
      }
    }
  })
}

const shutdown = async () => {
  await tmpFile.cleanup()
  await config.shutdown()
}

module.exports = {
  User,
  initialize,
  shutdown
}
