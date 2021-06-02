---
sidebar_position: 3
---
# Fields

Fields are specified as class attributes - static properties. Be careful not to choose field names that conflict with the [models API](/docs/models/DatabaseModel) like **save**, **create** or **delete**.

Example:

```javascript
const { DatabaseModel } = require('djorm/models')
const { CharField } = require('djorm/fields/CharField')
const { DateField } = require('djorm/fields/DateField')
const { ForeignKey } = require('djorm/fields/ForeignKey')
const { PositiveIntegerField } = require('djorm/fields/PositiveIntegerField')

class Musician extends DatabaseModel {
  id = new AutoField()
  firstName = new CharField({ maxLength: 30 })
  lastName = new CharField({ maxLength: 30 })
  instrument = new CharField({ maxLength: 100 })
}

class Album extends DatabaseModel {
  artist = new ForeignKey({ model: 'Musician', onDelete: ForeignKey.CASCADE })
  name = new CharField({ maxLength: 100 })
  releaseDate = new DateField()
  numStars = new PositiveIntegerField()
}

module.exports = { Musician, Album }
```

## Field types

Each field in your model should be an instance of the appropriate [Field class](/docs/models/fields/Field). Djorm uses the field class types to determine quite a few things:

* The column type which tells the database what kind of data to store (e.g. INTEGER,VARCHAR,TEXT)
* The type validations

## Field options

Each field takes a certain set of field-specific properties. For example [CharField](/docs/models/fields/CharField) requires maxLength.
