---
sidebar_position: 1
---
# Configuration

Djorm keeps a singleton instance of configuration. You should consolidate all config and settings side effects in one file to avoid nasty surprises.

Example of `settings.js`

```javascript
const { configure } = require('djorm/config')


configure({
  secretKey: process.env.SECRET_KEY || 'development-secret-key',
  databases: {
    default: {
      driver: 'djorm-db-mysql',
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      hostname: process.env.MYSQL_HOST,
    }
  }
})

```
