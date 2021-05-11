const workerpool = require('workerpool')

module.exports = workerpool.worker({
  runTask: async function (point, message) {
    const index = require(point.filename)
    const fn = index[point.entry]
    await fn(message)
  }
})
