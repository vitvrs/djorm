---
sidebar_position: 4
---
# Connect your app

This is the last step, after this, you're started. You need to connect the app to your code. Basically, there is the [`init`](/docs/init#init) and the [`shutdown`](/docs/init#shutdown) method. Both of them are asynchronous, on needs to be run at the start, one needs to be run at the end.

```javascript
const { init, shutdown } = require('djorm/config')

const main = async () => {
  await init()
  try {
    console.log('doing something')
  } finally {
    await shutdown()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(255)
})
```
