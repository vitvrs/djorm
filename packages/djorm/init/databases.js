const init = async databases => {
  const { Database } = require('../db/Database')
  const { configDb } = require('../db/DatabaseHub')
  Object.entries(databases).map(([dbName, dbConfig]) =>
    configDb(Database.resolveDriver(dbConfig), dbName)
  )
}

const shutdown = async () => {
  await require('../db/DatabaseHub').disconnect()
}

module.exports = { init, shutdown }
