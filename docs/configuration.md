# Configuration

Djorm gets configured via `configure` and `boot` methods from [djorm/config](../packages/djorm/config.js).


## Express.js

```javascript
const express = require('express')
const app = express()
const port = 3000

const { boot } = require('djorm/config')

const djormConfig = {
  databases: {
    default: {
      driver: 'djorm-db-mysql',
      username: 'username',
      password: 'password',
      hostname: 'localhost',
    }
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, async () => {
  await boot(djormConfig)
  console.log(`Example app listening at http://localhost:${port}`)
})
```

Prev: [Create first model](./create-first-model.md)
