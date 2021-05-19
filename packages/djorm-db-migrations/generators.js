const { DatabaseMigration } = require('./models')
const { CreateEntity, CreateLink, CreateProperty } = require('./entities')
const {
  getModel,
  getModelName,
  getAllModels
} = require('djorm/models/ModelRegistry')

const moment = require('moment')

const formatDate = date => date.format('YYYY-MM-DDTHH:mm:ss')

const formatNow = () => formatDate(moment())

const createModelInitialMigration = model => {
  const operations = model.fieldObjects
    .map(
      ([fieldName, field]) =>
        new CreateProperty({
          property: fieldName,
          field
        })
    )
    .concat(
      model.foreignKeyFields.map(
        ([, rel]) =>
          new CreateLink({
            property: rel.keyField,
            target: `${rel.model}__${getModel(rel.model).pkName}`
          })
      )
    )
  return new CreateEntity({
    model: getModelName(model),
    operations
  })
}

const createInitialMigration = appPath => {
  require(appPath)
  const identifier = `0001_auto_initial_${formatNow()}`
  const operations = getAllModels().map(model =>
    createModelInitialMigration(model)
  )
  return operations.length
    ? new DatabaseMigration({
        identifier,
        operations
      })
    : null
}

module.exports = { createInitialMigration }
