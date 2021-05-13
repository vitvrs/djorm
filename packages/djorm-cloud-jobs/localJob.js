/* istanbul ignore file */
/* This file is immune to test coverage reporting because it is always parsed in
 * a separate thread during runtime. */
const workerpool = require('workerpool')

module.exports = workerpool.worker({
  runJob: async (entry, message) => await require(entry).runJob(message)
})
