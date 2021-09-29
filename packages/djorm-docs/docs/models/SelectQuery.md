---
sidebar_position: 60
---
# Select Query

When you query model via [ObjectManager](./ObjectManager.md), you'll get a Select object.

## Select instance methods

### `all`

Promise to return all model instances

```javascript
await Pet.objects.query.all()
```

### `count`

Promise to count all model instances

```javascript
await Pet.objects.query.count()
```

### `distinct`

Select only distinct records.

```javascript
await Pet.objects.query.distinct().all()
```

### `exclude`

Exclude records matching filter. This is an inversion of [.filter](#filter)

```javascript
await Pet.objects.query.exclude({ name: 'John' }).all()
```

### `filter`

Include only records matching filter. This an inversion of [.exclude](#exclude).

```javascript
await Pet.objects.query.filter({ name: 'John' }).all()
```
  
### `first`

Promise to return first model instance. This is an inversion of [.last](#last)

```javascript
await Pet.objects.query.first()
```

### `get`

Filter model instances and get the first one or throw ObjectDoesNotExist

```javascript
await Pet.objects.query.filter({ id: 1 }).get()
```
  
### `last`

Promise to return the last model instance. This is an inversion of [.first](#first).

```javascript
await Pet.objects.query.last()
```

### `limit`

Select only certain amount of records.

```javascript

await Pet.objects.query.filter({ alive: true }).limit(100).all()
  
### `orderBy`

Create sorted query

```javascript
await Pet.objects.query.orderBy('name').all()
```

### `selectRelated`

Joins selected ForeignKey fields and automatically maps the model instances.

```javascript
await Pet.objects.query.selectRelated('owner', 'home').all()

/*
The pet objects will have owner and home preloaded

[
  {
    id: 1,
    ownerId: 101,
    homeId: 202,
    owner: {
      id: 101,
      name: 'John',
    },
    homeId: {
      id: 202,
      location: 'Prague'
    }
  },
  ...
]
*/
```


### `stream`

Stream read model instances with Node.js streams. Returns instance of [Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable).

```javascript
const src = Promise.objects.stream()
```
