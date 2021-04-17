const { DatabaseMapper } = require('djorm/db/DatabaseMapper')
const { Datastore } = require('@google-cloud/datastore')

class DatastoreMapper extends DatabaseMapper {
  static createMapper = Model => {
    if (!Model) {
      return null
    }
    return item =>
      new Model(
        Object.entries(item)
          .filter(([fieldKey]) => fieldKey !== Datastore.KEY)
          .reduce(
            (aggr, [fieldKey, fieldValue]) => ({
              ...aggr,
              [fieldKey]: fieldValue
            }),
            {}
          )
      )
  }
}

module.exports = { DatastoreMapper }
