# `djorm-storage-gcp`

> Google Cloud Platform storage driver for [Djorm](https://just-paja.github.io/djorm/)

## Installation

```shell
npm install --save djorm-storage-gcp
```

## Configuration

```javascript

config({
  storages: {
    default: {
      driver: 'djorm-storage-gcp.GcpFileStorage',
      basePath: '',
      bucketName: 'bucket-name',
      clientEmail: 'serviceaccount@gcp.com',
      privateKey: '### BEGIN PRIVATE KEY ...',
      projectId: 'gcp-project-id',
    }
  }
})
```
