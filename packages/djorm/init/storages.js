const init = storages => require('../storage/StorageHub').addInstances(storages)
const shutdown = () => require('../storage/StorageHub').destroy()

module.exports = { init, shutdown }
