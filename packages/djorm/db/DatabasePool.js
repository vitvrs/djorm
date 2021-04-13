const { Database } = require('./Database')
const { DatabaseError, NotConnected } = require('./errors')

class DatabasePool {
  databases = {}

  async connect (db, dbName = 'default') {
    if (db instanceof Database) {
      this.databases[dbName] = db
      await db.connect()
    } else {
      throw new DatabaseError(
        `Database "${dbName}" must be instance of Database`
      )
    }
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
    if (!db.connected) {
      throw new NotConnected(`Database "${dbName}" is not connected`)
    }
    return db
  }
}

let poolSingleton = new DatabasePool()

module.exports = {
  DatabasePool,
  connect: async (...args) => await poolSingleton.connect(...args),
  disconnect: async () => await poolSingleton.disconnect(),
  getDb: name => poolSingleton.getDb(name),
  get instance () {
    return poolSingleton
  },
  set instance (pool) {
    poolSingleton = pool
  }
}
