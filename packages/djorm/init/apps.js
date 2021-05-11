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

const init = async settings => {
  for (const app of settings.apps) {
    await initApp(app)
  }
}

const shutdown = async settings => {
  for (const app of settings.apps) {
    await shutdownApp(app)
  }
}

module.exports = { init, shutdown }
