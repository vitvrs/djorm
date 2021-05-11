const getAppConfigModule = app => require(app)

const initApp = async app => {
  const mod = getAppConfigModule()
  if (mod.init) {
    await mod.init()
  }
}

const shutdownApp = async app => {
  const mod = getAppConfigModule(app)
  if (mod.shutdown) {
    await mod.shutdown()
  }
}

const init = async apps => {
  for (const app of apps) {
    await initApp(app)
  }
}

const shutdown = async apps => {
  for (const app of apps) {
    await shutdownApp(app)
  }
}

module.exports = { init, shutdown }
