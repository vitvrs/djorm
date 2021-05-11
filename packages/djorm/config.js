let currentConfig = {
  name: 'djorm',
  apps: [],
  databases: {},
  logger: {
    level: 'info',
    transport: null,
    options: {}
  }
}

const configure = config => {
  currentConfig = { ...currentConfig, ...config }
}

const init = async config => {
  if (config) {
    configure(config)
  }
  const settings = currentConfig
  if (settings.apps) {
    require('./init/apps').init(settings)
  }
  require('./init/logger').init(settings)
  if (settings.databases) {
    require('./init/databases').init(settings.databases)
  }
}

const shutdown = async () => {
  require('./init/apps').shutdown(currentConfig)
  require('./init/logger').shutdown()
}

module.exports = {
  configure,
  init,
  shutdown,
  getSettings: () => currentConfig
}
