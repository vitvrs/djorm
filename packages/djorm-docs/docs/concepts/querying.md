---
sidebar_position: 5
---
# Querying

Djorm has a Query API simillar to the Django's, but it has quite a few differences due to the asynchronous nature of JavaScript.

## Quick example

```
const { Person } = require('./models')

const myMethod = async () => {
  const allPeople = await Person.objects.all()

  const activePeople = await Person.objects.filter({
    active: true
  })

  const personById = await Person.objects.get({ id: 1 })
}


module.exports = { myMethod }
```
