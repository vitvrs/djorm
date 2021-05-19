/* istanbul ignore file */

const path = require('path')
const hub = require('djorm/db/DatabaseHub')
const MysqlDatabase = require('..')
const tmp = require('tmp-promise')
const getPort = require('get-port')
const rimraf = require('rimraf')

const { promises } = require('fs')
const { spawn } = require('child_process')

const setupDb = dbName => {
  const username = `${process.env.USERNAME}@localhost`
  let databaseName
  let configFile
  let sockFile
  let dataDir
  let serverProcess
  let port

  const configServer = async () => {
    configFile = await tmp.file()
    sockFile = await tmp.file()
    dataDir = await tmp.dir()
    port = await getPort()
    await promises.writeFile(
      configFile.path,
      [
        '[mysqld]',
        `datadir=${dataDir.path}`,
        `socket=${sockFile.path}`,
        `port=${port}`
      ].join('\n')
    )
  }

  const initializeServer = async () => {
    return await new Promise((resolve, reject) => {
      const p = spawn('mysql_install_db', [
        `--defaults-file=${configFile.path}`
      ])
      p.on('close', exitCode => {
        if (exitCode === 0) {
          resolve()
        } else {
          reject(
            new Error(
              `Failed to initialize MySQL server. The process exited with exit code ${exitCode}`
            )
          )
        }
      })
    })
  }

  const startServer = async () => {
    return await new Promise((resolve, reject) => {
      serverProcess = spawn('mysqld', [`--defaults-file=${configFile.path}`])
      serverProcess.stderr.on('data', data => {
        const str = String(data)
        if (str.includes('ready for connections')) {
          resolve()
        }
      })
    })
  }

  const configDb = async databaseName => {
    const migrationPath = path.resolve(__dirname, dbName)
    const data = await promises.readFile(migrationPath)
    const sql = `CREATE DATABASE ${databaseName}; USE ${databaseName}; ${data}`
    await new Promise((resolve, reject) => {
      const p = spawn('mysql', [
        `--defaults-file=${configFile.path}`,
        '--host=localhost',
        `--user=${username}`,
        `--socket=${sockFile.path}`,
        `--port=${port}`
      ])
      p.stdin.setEncoding('utf-8')
      p.stderr.on('data', d => console.log(String(d)))
      p.stdin.write(sql)
      p.stdin.end()
      p.on('close', exitCode => {
        if (exitCode === 0) {
          resolve()
        } else {
          reject(
            new Error(
              `Failed to configure MySQL database. The process exited with exit code ${exitCode}`
            )
          )
        }
      })
    })
  }

  const stopServer = async () => {
    return await new Promise((resolve, reject) => {
      serverProcess.on('close', resolve)
      serverProcess.on('error', reject)
      serverProcess.kill()
    })
  }

  beforeAll(async () => {
    await configServer()
    await initializeServer()
    await startServer()
  })

  beforeEach(async () => {
    databaseName = `test_${jest
      .requireActual('uuid')
      .v4()
      .replace(/-/g, '_')}`
    await configDb(databaseName)
    const db = new MysqlDatabase({
      database: databaseName,
      username,
      port
    })
    const p = new hub.DatabaseHub()
    await p.connectDb(db)
    hub.instance = p
  })

  afterAll(async () => {
    await stopServer()
    await configFile.cleanup()
    await sockFile.cleanup()
    rimraf.sync(dataDir.path)
  })
}

module.exports = { setupDb }
