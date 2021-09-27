const { DatabaseMapper } = require('djorm/db/DatabaseMapper')
const { Datastore } = require('@google-cloud/datastore')

const getKeyValue = key => key && (key.id || key.name)

class DatastoreMapper extends DatabaseMapper {
  static createMapper = Model => {
    if (!Model) {
      return null
    }
    return item => {
      const { [Datastore.KEY]: key, ...data } = item
      const inst = new Model({
        [Model.pkName]: getKeyValue(key)
      })
      for (const [fieldName, value] of Object.entries(data)) {
        inst.consumeDbValue(fieldName, value)
      }
      return inst
    }
  }
}

module.exports = { DatastoreMapper }
