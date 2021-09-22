const { Database } = require('djorm/db/Database')
const { getSettings } = require('djorm/config')
const { MysqlFormatter } = require('./MysqlFormatter')
const { MysqlParser } = require('./MysqlParser')
const { MysqlReader } = require('./MysqlReader')
const { MysqlWriter } = require('./MysqlWriter')

const errors = require('djorm/db/errors')

const mysql = require('mysql')

const promise = async (fn, context, ...args) =>
  await new Promise((resolve, reject) => {
    fn.call(
      context,
      ...[
        ...args,
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        }
      ]
    )
  })

class MysqlDatabase extends Database {
  formatter = new MysqlFormatter()
  parser = new MysqlParser()
  db = null

  errorNumberMap = {
    1216: errors.MissingForeignKeyReference,
    1217: errors.RecordIsReferenced,
    1451: errors.RecordIsReferenced,
    1452: errors.MissingForeignKeyReference
  }

  async connectDb () {
    this.db = mysql.createConnection({
      database: this.props.database,
      debug: getSettings('debug', false),
      host: this.props.hostname,
      password: this.props.password,
      socketPath: this.props.socketPath,
      user: this.props.username,
      port: this.props.port,
      timezone: this.props.timezone
    })
    await promise(this.db.connect, this.db)
  }

  async disconnectDb () {
    let db = this.db
    this.db = null
    await promise(db.end, db)
    db = null
  }

  async execDb (str) {
    const result = await this.queryDb(str)
    return {
      ...result,
      insertId: result.insertId,
      changes: result.affectedRows
    }
  }

  async runMysqlOperation (str) {
    return await this.runDatabaseOperation(
      async () => await promise(this.db.query, this.db, str)
    )
  }

  async queryDb (str) {
    try {
      return await this.runMysqlOperation(str)
    } catch (e) {
      if (e.fatal) {
        // Assume that this could be a connection issue and try the query again
        await this.reconnect()
        return await this.runMysqlOperation(str)
      }
      throw e
    }
  }

  formatQuery (qs) {
    return this.formatter.formatQuery(qs)
  }

  createWriteStream (model) {
    return new MysqlWriter(this, model)
  }

  streamDb (qs) {
    return new MysqlReader(this, this.formatQuery(qs))
  }

  resolveErrorType (e) {
    return e && this.errorNumberMap[e.errno]
  }

  retypeError (err, ErrorType) {
    const typed = new ErrorType(err.message)
    typed.fatal = err.fatal
    typed.code = err.code
    typed.errno = err.errno
    typed.sqlMessage = err.sqlMessage
    typed.sqlState = err.sqlState
    typed.stack = err.stack
    return typed
  }
}

module.exports = MysqlDatabase
