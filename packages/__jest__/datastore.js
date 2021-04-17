const fetch = require('node-fetch')
const findCacheDir = require('find-cache-dir')
const fs = require('fs')
const path = require('path')
const tar = require('tar')

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

const installSdk = async () => {
  const downloadUrl = sdkUrl
  const downloadPath = getSdkDownloadPath(downloadUrl)
  const extractPath = getSdkExtractPath(downloadPath)

  await downloadSdk(downloadUrl, downloadPath)
  await extractSdk(downloadPath, extractPath)
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

const requireDatastore = () => {
  beforeAll(async () => {
    jest.setTimeout(300000)
    await installSdk()
    await installDatastore()
  })
}

module.exports = { requireDatastore, getSdkPath, startDatastore, stopDatastore }
