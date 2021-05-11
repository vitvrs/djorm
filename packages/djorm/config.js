let currentConfig = {
  databases: {}
}

const configure = config => {
  currentConfig = config
}

const init = async config => {
  if (config) {
    configure(config)
  }
  const settings = currentConfig
  if (settings.apps) {
    require('./init/apps').init(settings.apps)
  }
  if (settings.databases) {
    require('./init/databases').init(settings.databases)
  }
}

const shutdown = async () => {}

module.exports = {
  configure,
  init,
  shutdown,
  getSettings: () => currentConfig,
  get settings () {
    return currentConfig
  }
}
