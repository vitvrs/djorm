const getAppConfigModule = app => require(app)

const initApp = async app => await getAppConfigModule(app).init()
const shutdownApp = async app => await getAppConfigModule(app).shutdown()

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
