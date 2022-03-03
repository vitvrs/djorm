/* istanbul ignore file */
/* This file is immune to test coverage reporting because it is always parsed in
 * a separate thread during runtime. */

const getMod = async modPath => {
  try {
    return require(modPath)
  } catch (e) {
    return await import(modPath)
  }
}

module.exports = require('workerpool').worker({
  runJob: async (entry, message) => await (await getMod(entry)).runJob(message)
})
