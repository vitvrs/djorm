/* istanbul ignore file */

const path = require('path')
const tmp = require('tmp-promise')
const getPort = require('get-port')
const rimraf = require('rimraf')

const { promises } = require('fs')
const { spawn } = require('child_process')
const { configure } = require('djorm/config')

const setupDbServer = () => {
  const config = {
    username: `${process.env.USERNAME}@localhost`
  }

  global.djormMysql = config

  const configServer = async () => {
    config.configFile = await tmp.file()
    config.sockFile = await tmp.file()
    config.dataDir = await tmp.dir()
    config.port = await getPort()
    const mysqlCnf = [
      '[mysqld]',
      `datadir=${config.dataDir.path}`,
      `socket=${config.sockFile.path}`,
      `port=${config.port}`,
      'default-time-zone = "+00:00"'
    ]
    await promises.writeFile(config.configFile.path, mysqlCnf.join('\n'))
  }

  const initializeServer = async () => {
    return await new Promise((resolve, reject) => {
      const p = spawn('mysql_install_db', [
        `--defaults-file=${config.configFile.path}`
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
      config.serverProcess = spawn('mysqld', [
        `--defaults-file=${config.configFile.path}`
      ])
      config.serverProcess.stderr.on('data', data => {
        const str = String(data)
        if (str.includes('ready for connections')) {
          resolve()
        }
      })
    })
  }

  const stopServer = async () => {
    return await new Promise((resolve, reject) => {
      config.serverProcess.on('close', resolve)
      config.serverProcess.on('error', reject)
      config.serverProcess.kill()
    })
  }

  beforeAll(async () => {
    await configServer()
    await initializeServer()
    await startServer()
  })

  afterAll(async () => {
    await stopServer()
  })

  afterAll(async () => {
    rimraf.sync(config.dataDir.path)
  })

  afterAll(async () => {
    await config.sockFile.cleanup()
  })

  afterAll(async () => {
    await config.configFile.cleanup()
  })
}

const setupDb = dbName => {
  const configDb = async databaseName => {
    const config = global.djormMysql
    const migrationPath = path.resolve(__dirname, dbName)
    const data = await promises.readFile(migrationPath)
    const sql = `CREATE DATABASE ${databaseName}; USE ${databaseName}; ${data}`
    await new Promise((resolve, reject) => {
      const p = spawn('mysql', [
        `--defaults-file=${config.configFile.path}`,
        '--host=localhost',
        `--user=${config.username}`,
        `--socket=${config.sockFile.path}`,
        `--port=${config.port}`
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

  let databaseName

  beforeEach(async () => {
    const config = global.djormMysql
    databaseName = `test_${jest
      .requireActual('uuid')
      .v4()
      .replace(/-/g, '_')}`
    await configDb(databaseName)
    configure({
      databases: {
        default: {
          driver: 'djorm-db-mysql',
          host: 'localhost',
          database: databaseName,
          username: config.username,
          port: config.port,
          timezone: 'Z'
        }
      }
    })
  })
}

module.exports = { setupDb, setupDbServer }
