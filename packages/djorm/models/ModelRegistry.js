const models = {}
const relations = {}

function getModelName (model) {
  if (model.meta && model.meta.modelName) {
    return model.meta.modelName
  }
  return model.name
}

function getModel (name) {
  const m = models[name]
  if (!m) {
    throw new Error(`Model "${name}" was not found`)
  }
  return m
}

function getModels () {
  return models
}

function getRelationRefName (modelName, relatedName) {
  return `${modelName}__${relatedName}`
}

function registerModelRelations (modelName, model) {
  const modelRelations = model.relationFields
  if (modelRelations) {
    for (const [, field] of modelRelations) {
      field.parentModel = modelName
      relations[getRelationRefName(field.model, field.relatedName)] = field
    }
  }
}

function unregisterModelRelations (modelName) {
  for (const key of Object.keys(relations)) {
    if (key.startsWith(`${modelName}__`)) {
      delete relations[key]
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

function getRelation (model, relatedName) {
  return relations[getRelationRefName(getModelName(model), relatedName)]
}

module.exports = {
  getModel,
  getModelName,
  getModels,
  getRelation,
  registerModel,
  unregisterModel
}
