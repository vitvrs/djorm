let currentConfig = {
  databases: {}
}

const configure = config => {
  currentConfig = config
}

const init = async config => {
  configure(config)
  const settings = currentConfig

  if (settings.databases) {
    const { Database } = require('./db/Database')
    const { configDb } = require('./db/DatabasePool')
    Object.entries(settings.databases).map(([dbName, dbConfig]) =>
      configDb(Database.resolveDriver(dbConfig), dbName)
    )
  }
}

const shutdown = async () => {
  require('./models/ModelRegistry').clearModels()
}

module.exports = {
  configure,
  init,
  shutdown,
  get settings () {
    return currentConfig
  }
}
