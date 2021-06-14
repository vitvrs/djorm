const { DjormError } = require('../errors')

class ConfigurationError extends DjormError {}
class DatabaseError extends DjormError {}
class NotConnected extends DatabaseError {}

class QueryError extends DjormError {}
class QueryFormatterError extends DjormError {}
class UnknownType extends QueryError {}

class ForeignKeyError extends DatabaseError {}

class MissingForeignKeyReference extends ForeignKeyError {}
class RecordIsReferenced extends ForeignKeyError {}

module.exports = {
  ConfigurationError,
  DatabaseError,
  MissingForeignKeyReference,
  NotConnected,
  QueryError,
  QueryFormatterError,
  RecordIsReferenced,
  UnknownType
}
