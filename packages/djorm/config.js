let currentConfig = {
  apps: [],
  databases: {},
  name: 'djorm',
  storages: {
    default: {
      driver: 'djorm/storage/FileSystemStorage'
    }
  },
  logger: {
    level: 'info',
    transport: null,
    options: {}
  }
}

const configure = config => {
  currentConfig = { ...currentConfig, ...config }
}
const getSettings = (configPath, defaultValue = null) => {
  if (!configPath) {
    return currentConfig
  }
  const result = require('jsonpath').value(currentConfig, configPath)
  return result === undefined ? defaultValue : result
}

const init = async () => {
  const settings = getSettings()
  if (settings.apps) {
    await require('./init/apps').init(settings)
  }
  await require('./init/logger').init(settings)
  if (settings.storages) {
    require('./init/storages').init(settings.storages)
  }
  if (settings.databases) {
    await require('./init/databases').init(settings.databases)
  }
}

const shutdown = async () => {
  const settings = getSettings()
  require('./init/apps').shutdown(settings)
  require('./init/logger').shutdown()
  require('./init/storages').shutdown()
  require('./init/databases').shutdown()
}

module.exports = {
  configure,
  getSettings,
  init,
  shutdown
}
