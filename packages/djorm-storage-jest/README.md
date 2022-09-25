# `djorm-storage-jest`

> Jest testing dummy storage driver for [Djorm](https://just-paja.github.io/djorm)

It does not save any files, just provides jest mocks in place of the driver methods. See the source for details.

## Installation

```shell
npm install --save-dev djorm-storage-jest
```

## Configuration

```javascript

config({
  storages: {
    default: {
      driver: 'djorm-storage-jest.JestFileStorage',
    }
  }
})
```
