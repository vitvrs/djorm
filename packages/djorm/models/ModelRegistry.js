let registry = []

function getModelName (model) {
  if (model.meta && model.meta.modelName) {
    return model.meta.modelName
  }
  return model.name
}

function getModel (name) {
  const m = registry.find(model => getModelName(model) === name)
  if (!m) {
    throw new Error(`Model "${name}" was not found`)
  }
  return m
}

function getModels () {
  return registry
}

function registerModel (model) {
  registry = [...registry, model]
}

function unregisterModel (model) {
  registry = registry.filter(item => item !== model)
}

module.exports = {
  getModel,
  getModelName,
  getModels,
  registerModel,
  unregisterModel
}
