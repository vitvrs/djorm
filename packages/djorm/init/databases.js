const init = async databases => {
  const { Database } = require('../db/Database')
  const { configDb } = require('../db/DatabasePool')
  Object.entries(databases).map(([dbName, dbConfig]) =>
    configDb(Database.resolveDriver(dbConfig), dbName)
  )
}

module.exports = { init }
