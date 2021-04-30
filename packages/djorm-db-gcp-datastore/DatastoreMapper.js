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
      return new Model({
        ...data,
        [Model.pkName]: getKeyValue(key)
      })
    }
  }
}

module.exports = { DatastoreMapper }
