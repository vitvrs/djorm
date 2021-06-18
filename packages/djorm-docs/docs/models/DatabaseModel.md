---
sidebar_position: 1
---
# Database Model

This is the base class for your models.

## Model attributes

### `objects`

This is the [ObjectManager](./ObjectManager.md) connected to the model, it provides interface to query the database.

```javascript
const { DatabaseModel } = require('djorm/models/DatabaseModel')
const { DateField } = require('djorm/fields/DateField')
const { CharField } = require('djorm/fields/CharField')

class Person extends DatabaseModel {
  static firstName = new CharField()
  static lastName = new CharField()
  static birth = new DateField()
}

async function getAllJohns() {
  // Accessing the object manager
  return await Person.objects.filter({ firstName: 'John' }).all()
}
```

## Model methods

This is the public model API intended for use. Feel free to extend these methods

### `save()`

Store the model instance in the database updating the current database record given it was pulled from the database or creating new one otherwise.

Save calls [create](#create) and [update](#update) internally.

```javascript
const person = await Person.objects.get({ id: 1 })
person.firstName = 'George'
await person.save()
```

### `create()`

Create new database record.

```javascript
const person = new Person({
  firstName: 'Matthew',
  lastName: 'Barnes',
  birth: '1964-12-24'
})
await person.create()
```

### `update()`

Update existing database record.

```javascript
const person = await Person.objects.get({ id: 1 })
person.firstName = 'George'
await person.update()
```

### `delete()`

Delete existing database record.

```javascript
const person = await Person.objects.get({ id: 1 })
await person.delete()
```

### `reload()`

Query the database for current entity state and store it in the instance.

```javascript
const person = await Person.objects.get({ id: 1 })
await person.refresh()
```
