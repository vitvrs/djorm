const { Database } = require('./Database')
const { DatabaseError } = require('./errors')

class DatabaseHub {
  databases = {}

  configDb (db, dbName = 'default') {
    if (db instanceof Database) {
      this.databases[dbName] = db
    } else {
      throw new DatabaseError(
        `Database "${dbName}" must be instance of Database`
      )
    }
  }

  async connectDb (db, dbName = 'default') {
    this.configDb(db, dbName)
    await this.connectDbInstance(dbName)
  }

  async connectDbInstance (dbName) {
    await this.databases[dbName].connect()
  }

  async connectAll () {
    await Promise.all(
      Object.keys(this.databases).map(dbName => this.connectDbInstance(dbName))
    )
  }

  async disconnect () {
    await Promise.all(Object.values(this.databases).map(db => db.disconnect()))
    this.databases = {}
  }

  getDb (dbName) {
    const db = this.databases[dbName]
    if (!db) {
      throw new DatabaseError(`Database "${dbName}" is not available`)
    }
    return db
  }
}

let hubSingleton = new DatabaseHub()

module.exports = {
  DatabaseHub,
  connect: async (...args) => await hubSingleton.connectDb(...args),
  disconnect: async () => await hubSingleton.disconnect(),
  getDb: name => hubSingleton.getDb(name),
  configDb: (db, dbName) => hubSingleton.configDb(db, dbName),
  get instance () {
    return hubSingleton
  },
  set instance (hub) {
    hubSingleton = hub
  }
}
