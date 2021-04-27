const { ModelError } = require('../errors')

const models = {}
const relationships = {}

const getModelName = model =>
  model.meta && model.meta.modelName ? model.meta.modelName : model.name

const getModels = () => models
const getRelationships = () => relationships
const getRelationRefName = (modelName, relatedName) =>
  `${modelName}__${relatedName}`

function getModel (name) {
  const m = models[name]
  if (!m) {
    throw new ModelError(`Model "${name}" was not found`)
  }
  return m
}

function registerModelRelations (modelName, model) {
  const modelRelations = model.relationFields
  if (modelRelations) {
    for (const [, field] of modelRelations) {
      field.parentModel = modelName
      relationships[getRelationRefName(field.model, field.relatedName)] = field
    }
  }
}

function unregisterModelRelations (modelName) {
  for (const key of Object.keys(relationships)) {
    if (key.startsWith(`${modelName}__`)) {
      delete relationships[key]
    }
  }
}

function registerModel (model) {
  const modelName = getModelName(model)
  models[modelName] = model
  registerModelRelations(modelName, model)
  return model
}

function unregisterModel (model) {
  const modelName = getModelName(model)
  delete models[modelName]
  unregisterModelRelations(modelName)
}

function getRelationship (model, relatedName) {
  return relationships[getRelationRefName(getModelName(model), relatedName)]
}

const clearObj = obj =>
  Object.keys(obj).forEach(key => {
    delete obj[key]
  })

const clearModels = () => {
  clearObj(models)
  clearObj(relationships)
}

const isAbstract = model => {
  const meta = Object.getOwnPropertyDescriptor(model, 'meta')
  return Boolean(meta && meta.value && meta.value.abstract)
}

module.exports = {
  clearModels,
  getModel,
  getModelName,
  getModels,
  getRelationship,
  getRelationships,
  isAbstract,
  registerModel,
  unregisterModel
}
