# `djorm-db-gcp-datastore`

**Don't expect full support**. Datastore is a NoSQL database and it is quite different to relational databases. The drivers supports only simple queries. Perhaps this driver will be able to provide better mapping to djorm queries when Google releases GQL support to [@google-cloud/datastore](https://www.npmjs.com/package/@google-cloud/datastore).

Please make sure you check out Datastore docs, especially [the part about consistency](https://cloud.google.com/datastore/docs/articles/balancing-strong-and-eventual-consistency-with-google-cloud-datastore).

## Supported

* Datastore Namespaces as part of database config
* Database Model represents Datastore Entity kind
* Database Model's primary key represents Datastore Entity key (CharField or Number)
* Filter entities based on primary key
* Filter entities with simple filter
* Insert entities
* Auto generate primary key
* Update entities via primary key
* Delete entities via primary key

## Todo

* Driver compatibility layer to limit API to safe options
* Support complex queries via Conjunctive normal form
* Batch operations (for example equivalent `DELETE FROM table WHERE updated < '2020-10'`)
* `OR` operator abstraction
* `IN` / `NOT IN` comparison operator abstraction
* Index migrations

[Docs](https://github.com/just-paja/djorm/tree/master/docs)
