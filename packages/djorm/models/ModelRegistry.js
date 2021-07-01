const { ModelError } = require('../errors')

const SELF = Symbol('models.Self')
const models = {}
const refs = {}

const getModelName = model => {
  const modelName =
    (model.meta && model.meta.modelName) ||
    (typeof model.name === 'string' && model.name)
  if (!modelName) {
    throw new ModelError(
      `Following model has class name overriden: ${Object.getOwnPropertyNames(
        model
      )}. Perhaps you will need to define a Meta class with \`modelName\` in it.`
    )
  }
  return modelName
}

const getModels = () => models
const getRelationships = () => refs
const getRelationRefName = (modelName, relatedName) =>
  `${modelName}__${relatedName}`

const getMeta = model => {
  const desc = Object.getOwnPropertyDescriptor(model, 'meta')
  return desc && desc.value
}

const isAbstract = model => {
  const meta = getMeta(model)
  return Boolean(meta && meta.abstract)
}

function getModel (name) {
  const m = models[name]
  if (!m) {
    throw new ModelError(`Model "${name}" was not found`)
  }
  return m
}

function registerModelRelations (modelName, model) {
  const modelRelations = model.relationFields
  if (!isAbstract(model) && modelRelations) {
    for (const [fieldName, field] of modelRelations) {
      const parentModel =
        field.get('parentModel') === SELF ? modelName : field.parentModel
      const targetModel =
        field.get('model') === SELF ? modelName : field.get('model')
      const refName = getRelationRefName(targetModel, field.get('relatedName'))
      refs[refName] = [parentModel, fieldName]
    }
  }
}

function unregisterModelRelations (modelName) {
  for (const key of Object.keys(refs)) {
    if (key.startsWith(`${modelName}__`)) {
      delete refs[key]
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
  return refs[getRelationRefName(getModelName(model), relatedName)]
}

const clearObj = obj =>
  Object.keys(obj).forEach(key => {
    delete obj[key]
  })

const clearModels = () => {
  clearObj(models)
  clearObj(refs)
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
  unregisterModel,
  SELF
}
