---
sidebar_position: 4
---
# Settings

## apps

Default: `[]` (Empty array)

Djorm borrows the concept of apps from Django. Some apps require initialization before they can be used. Reference them inside djorm settings so it can initialize and shutdown apps when the moment is right

## databases

Default: `{}` (Empty object)

Configure database backends your application will communicate with. Key can be referenced in [models](/docs/concepts/models) to determine which database will be used.

The simplest possible settings is for single database setup using SQLite. This can be configured using following:

```javascript
configure({
  databases: {
    default: {
      driver: 'djorm-db-sqlite',
      path: 'database.sqlite'
    }
  }
})
```

When connecting to other databas backends, such as PostgreSQL, MariaDB or MySQL, additional connection parameters will be required.

> Usually you'll want to have separate configuration for local development and your other environments. Use environmental variables for that.

### driver

The database backend to use. Here are some of the supported drivers:

* [`'djorm-db-mysql'`](https://github.com/just-paja/djorm/tree/master/packages/djorm-db-mysql)
* [`'djorm-db-gcp-bigquery'`](https://github.com/just-paja/djorm/tree/master/packages/djorm-db-gcp-bigquery)
* [`'djorm-db-gcp-datastore'`](https://github.com/just-paja/djorm/tree/master/packages/djorm-db-gcp-datastore)
* [`'djorm-db-sqlite'`](https://github.com/just-paja/djorm/tree/master/packages/djorm-db-sqlite)

### connectionMaxAge

Default: 0

The lifetime of a database connection, as an integer of miliseconds. Use 0 to close database connections at the end of each request and `null` for unlimited persistent connections.

### password

Default: `null`

The password to use when connecting to the database.

### port

Default: `null`

The port to use when connecting to the database. Use `null` for the default port.

### user

Default: `null`

The username to use when connecting to the database.


## logger

Djorm uses [Pino.js](https://github.com/pinojs/pino) internally as a logger. This configuration is passed directly to the logger.

### level

Default: `'info'`

[Pino.js level](https://github.com/pinojs/pino/blob/master/docs/api.md#logger-level), the logger will display messages with severity same or higher to this setting.

### transport

Default: `null`

You can customize the transport that delivers your logs by specifying a require path.
