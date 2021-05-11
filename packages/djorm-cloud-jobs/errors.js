class JobError extends Error {}

class RetryError extends JobError {}
class SpawnError extends JobError {}
class RuntimeError extends JobError {}

function formatError (e) {
  const str = []
  if (e.message) {
    str.push(`${e.message}\n`)
  }
  if (e.errors) {
    for (const err of e.errors) {
      str.push(formatError(err))
    }
  }
  if (e.row) {
    str.push(JSON.stringify(e.row, null, 2))
  }
  if (e.stack) {
    str.push(`\n${e.stack}`)
  }
  return str.join(' ')
}

module.exports = {
  formatError,
  JobError,
  RetryError,
  RuntimeError,
  SpawnError
}
