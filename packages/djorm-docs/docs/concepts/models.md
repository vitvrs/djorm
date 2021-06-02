---
sidebar_position: 2
---
# Models

A model represents a database entity. It is a class with fields that describe data you're storing in your database. You use models to abstract away the database specific code.

## Define a model

To define a model,

* extend [djorm/models/DatabaseModel](docs/models/DatabaseModel)
* define fields
* register the model.

## Quick example

In this example we create a **Person** with **firstName** and **lastName**:

```javascript
const { DatabaseModel } = require('djorm/models')
const { CharField } = require('djorm/fields/CharField')

class Person extends DatabaseModel {
  id = new AutoField()
  firstName = new CharField({ maxLength: 30 })
  lastName = new CharField({ maxLength: 30 })
}

module.exports = { Person }
```

> Following will apply once the migrations feature is finished.

The above **Person** model would create database table like this:

```sql
CREATE TABLE person (
  "id" INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  "firstName" VARCHAR(30) NOT NULL,
  "lastName" VARCHAR(30) NOT NULL
);
```

### Technical notes

* The table name is derived from the model name
* Unlike Django, the **id** field is not automatically added to the model
* The SQL is generated using MySQL driver. To use other drivers, configure your databases.
