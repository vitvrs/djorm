const { DatabaseMapper } = require('djorm/db/DatabaseMapper')
const { Datastore } = require('@google-cloud/datastore')

class DatastoreMapper extends DatabaseMapper {
  static createMapper = Model => {
    if (!Model) {
      return null
    }
    return item => {
      const { [Datastore.KEY]: key, ...data } = item
      return new Model({
        ...data,
        [Model.pkName]: item[Datastore.KEY].id
      })
    }
  }
}

module.exports = { DatastoreMapper }
