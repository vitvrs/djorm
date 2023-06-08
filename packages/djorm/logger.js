const noop = () => {}

const defaultLogger = {
  child () {
    return this
  },
  debug: noop,
  error: console.error,
  fatal: console.fatal,
  info: noop,
  trace: noop,
  silent: noop,
  warn: console.warn
}

let logger = defaultLogger

const init = inst => {
  logger = inst
}

const shutdown = () => {
  logger = defaultLogger
}

const getLogger = () => logger
const proxy = method => (...args) => getLogger()[method](...args)

module.exports = {
  child: proxy('child'),
  debug: proxy('debug'),
  error: proxy('error'),
  fatal: proxy('fatal'),
  getLogger,
  info: proxy('info'),
  init,
  shutdown,
  trace: proxy('trace'),
  silent: proxy('silent'),
  warn: proxy('warn')
}
