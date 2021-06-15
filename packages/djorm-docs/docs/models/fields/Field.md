---
sidebar_position: 6
---
# Field

Djorm expects all fields to inherit from `Field`.

## Field options

The following props are available to all field types. All are optional.

### `null`

**Field.null**

If `true`, Djorm will store empty values as `null` in the database. Default is `false`.

Avoid using `null` on string-based fields such as [CharField](./CharField.md) and [TextField](./TextField.md). If a string-based field has `null:  true`, that means it has two possible values for “no data”: `null`, and the empty string. In most cases, it’s redundant to have two possible values for "no data;" the Djorm convention is to use the empty string, not `null`.

### `choices`

**Field.choices**

Either array of values or key-value pair object to use as choices for this field. If choices are given, they are enforced by model validation.

```
new Field({
  choices: ['CZ', 'SK']
})
```

### `default`

**Field.default**

The default value for this field. This can be either a value or a function. If it is a function, it will be called every time a new object is created.

```
new Field({
  default: 42
})

new Field({
  default: inst => `${inst.name} (Human)`
})
```

