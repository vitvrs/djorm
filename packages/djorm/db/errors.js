const { DjormError } = require('../errors')

class ConfigurationError extends DjormError {}
class DatabaseError extends DjormError {}
class NotConnected extends DatabaseError {}

class QueryError extends DjormError {}
class QueryFormatterError extends DjormError {}

module.exports = {
  ConfigurationError,
  DatabaseError,
  NotConnected,
  QueryError,
  QueryFormatterError
}
