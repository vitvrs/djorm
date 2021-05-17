const init = async () => {
  await require('./pubsub').init()
}

const shutdown = async () => {
  await require('./pubsub').shutdown()
  await require('./entry').shutdown()
}

module.exports = {
  init,
  shutdown
}
