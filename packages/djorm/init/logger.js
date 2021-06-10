const logger = require('../logger')

const init = async settings => {
  const pino = require('pino')
  const createTransport = settings.logger.transport
    ? require(settings.logger.transport)
    : null
  const options = {
    name: settings.name,
    level: settings.logger.level || 'info'
  }
  if (!createTransport) {
    options.prettyPrint = {}
  }
  logger.init(
    pino(options, createTransport && createTransport(settings.logger.options))
  )
}

const shutdown = async () => {
  logger.shutdown()
}

module.exports = { init, shutdown }
