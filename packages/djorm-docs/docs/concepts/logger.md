---
sidebar_position: 4
---
# Logger

Djorm internally uses [Pino logger](https://getpino.io/#/). It gets configured via [settings.logger](/docs/settings). Default log level is `info`, to debug it, set it higher.

```javascript
const { configure } = require('djorm/config')

configure({
  logger: {
    level: 'debug'
  }
})
```
