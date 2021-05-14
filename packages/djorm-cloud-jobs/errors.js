/** Failures related to djorm-cloud-jobs
 * @augments {Error}
 */
class JobError extends Error {}

/** Failures when retrying job execution
 * @augments {JobError}
 */
class RetryError extends JobError {}

/** failures when spawning job
 * @augments {joberror}
 */
class SpawnError extends JobError {}

/** Failures during job run time
 * @augments {JobError}
 */
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
