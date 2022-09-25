const init = databases => require('../db/DatabaseHub').addInstances(databases)
const shutdown = () => require('../db/DatabaseHub').destroy()

module.exports = { init, shutdown }
