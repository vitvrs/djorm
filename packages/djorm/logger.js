let logger = null

const init = inst => {
  logger = inst
}

const shutdown = () => {
  logger = null
}

module.exports = {
  getLogger: () => logger,
  init,
  shutdown
}
