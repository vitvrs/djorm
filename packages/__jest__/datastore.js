/* istanbul ignore file */

const DatastoreDatabase = require('../djorm-db-gcp-datastore')
const fetch = require('node-fetch')
const findCacheDir = require('find-cache-dir')
const fs = require('fs')
const getPort = require('get-port')
const path = require('path')
const pool = require('../djorm/db/DatabasePool')
const tar = require('tar')

const { Datastore } = require('@google-cloud/datastore')
const { spawn } = require('child_process')

const sdkUrl =
  'https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-336.0.0-linux-x86_64.tar.gz'
const getCacheDir = () => findCacheDir({ name: 'djorm' })
const getSdkDownloadPath = url => path.join(getCacheDir(), path.basename(url))
const getSdkExtractPath = downloadPath =>
  path.join(getCacheDir(), 'google-cloud-sdk')
const getSdkPath = () => getSdkExtractPath(getSdkDownloadPath(sdkUrl))
const getSdkBin = () => path.join(getSdkPath(), 'bin', 'gcloud')
const ensureCacheDir = async () =>
  fs.promises.mkdir(getCacheDir(), { recursive: true })

const exists = async filePath => {
  try {
    await fs.promises.stat(filePath)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }
    throw err
  }
}

const downloadSdk = async (downloadUrl, downloadPath) => {
  await ensureCacheDir()
  if (!(await exists(downloadPath))) {
    console.log('Downloading gcloud SDK')
    const res = await fetch(downloadUrl)
    const dest = fs.createWriteStream(downloadPath)
    if (res.ok) {
      fs.closeSync(fs.openSync(downloadPath, 'w'))
      await new Promise((resolve, reject) => {
        res.body
          .pipe(dest)
          .on('error', reject)
          .on('finish', resolve)
      })
    } else {
      throw new Error('Failed to download gcloud sdk')
    }
  }
}

const extractSdk = async (downloadPath, extractPath) => {
  if (!(await exists(extractPath))) {
    console.log('Installing gcloud SDK')
    await tar.extract({
      file: downloadPath,
      cwd: getCacheDir()
    })
  }
}

const getProjectId = async () => {
  return await new Promise((resolve, reject) => {
    let data = ''
    const p = spawn(getSdkBin(), ['config', 'get-value', 'project'])
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.stderr.on('data', d => {
      data += d
    })
    p.on('close', () => resolve(data.trim()))
    p.on('error', reject)
  })
}

const configureSdkProject = async () => {
  const projectId = await getProjectId()
  if (projectId === '(unset)') {
    return await new Promise((resolve, reject) => {
      const p = spawn(getSdkBin(), [
        'config',
        'set',
        'project',
        'djorm-test-suite'
      ])
      p.stdout.pipe(process.stdout)
      p.stderr.pipe(process.stderr)
      p.on('close', resolve)
      p.on('error', reject)
    })
  }
}

const installSdk = async () => {
  const downloadUrl = sdkUrl
  const downloadPath = getSdkDownloadPath(downloadUrl)
  const extractPath = getSdkExtractPath(downloadPath)

  await downloadSdk(downloadUrl, downloadPath)
  await extractSdk(downloadPath, extractPath)
  await configureSdkProject()
  await installBeta()
}

const installComponent = async component => {
  return await new Promise((resolve, reject) => {
    const p = spawn(getSdkBin(), [
      'components',
      'install',
      component,
      '--quiet'
    ])
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('error', reject)
    p.on('close', resolve)
  })
}

const installBeta = async () => await installComponent('beta')
const installDatastore = async () =>
  await installComponent('cloud-datastore-emulator')

const startDatastore = async port => {
  return await new Promise((resolve, reject) => {
    const p = spawn(getSdkBin(), [
      'beta',
      'emulators',
      'datastore',
      'start',
      `--host-port=localhost:${port}`,
      '--no-store-on-disk'
    ])
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.stderr.on('data', row => {
      if (String(row).includes('is now running')) {
        resolve(p)
      }
    })
  })
}

const stopDatastore = async p => {
  await new Promise((resolve, reject) => {
    p.on('exit', () => setTimeout(resolve, 1000))
    p.on('close', resolve)
    p.kill('SIGKILL')
  })
}

const setupDb = dbPath => {
  let dsProcess
  let port

  beforeAll(async () => {
    port = await getPort()
    dsProcess = await startDatastore(port)
  })

  afterAll(async () => {
    await stopDatastore(dsProcess)
  })

  beforeEach(async () => {
    const models = require(dbPath)
    const dsSettings = {
      apiEndpoint: `http://localhost:${port}`,
      namespace: jest.requireActual('uuid').v4(),
      projectId: 'test-project'
    }
    const ds = new Datastore(dsSettings)
    const db = new DatastoreDatabase(dsSettings)
    const p = new pool.DatabasePool()
    await p.connectDb(db)
    pool.instance = p
    for (const [Model, items] of Object.entries(models)) {
      for (const data of items) {
        const { id, ...fields } = data
        const key = ds.key([Model, id])
        const entity = { key, data: fields }
        await ds.insert(entity)
      }
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterEach(async () => {
    await pool.instance.disconnect()
  })
}

module.exports = {
  getSdkPath,
  installSdk,
  installDatastore,
  startDatastore,
  stopDatastore,
  setupDb
}
