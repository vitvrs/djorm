const init = async databases => {
  const { Database } = require('../db/Database')
  const { configDb } = require('../db/DatabaseHub')
  Object.entries(databases).map(([dbName, dbConfig]) =>
    configDb(Database.resolveDriver(dbConfig), dbName)
  )
}

const shutdown = async () => {
  const { disconnect } = require('../db/DatabaseHub')
  await disconnect()
}

module.exports = { init, shutdown }
