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
    const { connect } = require('./db/DatabasePool')
    await Promise.all(
      Object.entries(settings.databases).map(async ([dbName, dbConfig]) => {
        const db = Database.resolveDriver(dbConfig)
        await connect(db, dbName)
      })
    )
  }
  // blah
}

const shutdown = () => {}

module.exports = {
  configure,
  init,
  shutdown,
  get settings () {
    return currentConfig
  }
}
