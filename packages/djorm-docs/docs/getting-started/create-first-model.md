---
sidebar_position: 3
---
# Create first model

```javascript
const { DatabaseModel } = require('djorm/models')
const { CharField, BooleanField, DateField, DateTimeField } = require('djorm/fields')

class User extends DatabaseModel {
  static firstName = new CharField()
  static lastName = new CharField()
  static active = new BooleanField({ default: true })
  static birth = new DateField()
  static lastLogin = new DateTimeField()
}

User.register()

module.exports = {
  User
}
```

Prev: [Installation](./installation.md) | Next: [Configuration](./configuration.md)
