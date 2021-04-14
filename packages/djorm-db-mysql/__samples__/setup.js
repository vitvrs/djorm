/* istanbul ignore file */

const path = require('path')
const pool = require('djorm/db/DatabasePool')
const MysqlDatabase = require('..')
const tmp = require('tmp-promise')
const getPort = require('get-port')
const rimraf = require('rimraf')

const { promises } = require('fs')
const { spawn } = require('child_process')

const setupDb = dbName => {
  const databaseName = 'test_database'
  const username = `${process.env.USERNAME}@localhost`
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

  const configDb = async () => {
    const migrationPath = path.resolve(__dirname, dbName)
    const data = await promises.readFile(migrationPath)
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
      p.stdin.write(data)
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

  beforeEach(async () => {
    await configServer()
    await initializeServer()
    await startServer()
    await configDb()

    const db = new MysqlDatabase({
      database: databaseName,
      username,
      port
    })
    const p = new pool.DatabasePool()
    await p.connect(db)
    pool.instance = p
  })

  afterEach(async () => {
    await stopServer()
    await configFile.cleanup()
    await sockFile.cleanup()
    rimraf.sync(dataDir.path)
  })
}

module.exports = { setupDb }
