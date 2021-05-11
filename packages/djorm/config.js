let currentConfig = {
  apps: [],
  databases: {},
  name: 'djorm',
  logger: {
    level: 'info',
    transport: null,
    options: {}
  }
}

const configure = config => {
  currentConfig = { ...currentConfig, ...config }
}
const getSettings = () => currentConfig

const init = async () => {
  const settings = getSettings()
  if (settings.apps) {
    await require('./init/apps').init(settings)
  }
  await require('./init/logger').init(settings)
  if (settings.databases) {
    await require('./init/databases').init(settings.databases)
  }
}

const shutdown = async () => {
  const settings = getSettings()
  require('./init/apps').shutdown(settings)
  require('./init/logger').shutdown()
}

module.exports = {
  configure,
  getSettings,
  init,
  shutdown
}
