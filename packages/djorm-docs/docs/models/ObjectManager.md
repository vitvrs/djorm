---
sidebar_position: 2
---
# Object Manager

An Object Manager is the interface through which database query operations are provided to Djorm models. It is accessible via [`objects`](./DatabaseModel.md#objects) property on each model. It provides a subset of Query properties and methods.

Each Object Manager has a default query, which can be overriden


### `createWriteStream`

Stream insert model instances with Node.js streams.

```javascript
const dest = Promise.objects.createWriteStream()
dest.write({
  firstName: 'John',
  lastName: 'Smith',
})
```

### `all`

Promise to return all model instances

```javascript
await Promise.objects.all()
```
  
### `first`

Promise to return first model instance

```javascript
await Promise.objects.first()
```

### `get`

Filter model instances and get the first one or throw ObjectDoesNotExist

```javascript
await Promise.objects.get({
  id: 1
})
```

### `count`

Promise to count all model instances

```javascript
await Promise.objects.count()
```

### `stream`

Stream read model instances with Node.js streams. Returns instance of [Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable).

```javascript
const src = Promise.objects.stream()
```

### `filter`

Create a filtered query

```javascript
await Promise.objects.filter({ name: 'John' }).all()
```
  
### `orderBy`

Create sorted query

```javascript
await Promise.objects.orderBy('name').all()
```
