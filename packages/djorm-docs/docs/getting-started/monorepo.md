---
sidebar_position: 3
---
# Monorepo

If your app lives inside a monorepo (for example [managed by lerna](https://lerna.js.org/)), you should consider creating core package to handle configuration and model definition. All packages using models should then depend on the core package.

This is an example of lerna package structure

```
spotify-stats-loader/
├─ node_modules/
├─ packages/
│  ├─ core/
│  │  ├─ models.js
│  │  ├─ settings.js
│  │  └─ package.json
│  ├─ episode-loader/
│  │  ├─ index.js
│  │  └─ package.json
│  └─ stats-loader/
│     ├─ index.js
│     └─ package.json
├─ .gitignore
├─ package.json
├─ package-lock.json
└─ README.md
```

## Dependencies

Make sure that both `episode-loader` and `stats-loader` depend on the `core`. This would be `packages/episode-loader/package.json`

```json
{
  "name": "stats-loader",
  "dpendencies": {
    "core": "file:../core"
  }
}
```

## Requiring models

This could be body of the `packages/episode-loader/index.js`

```javascript
const { SpotifyEpisode } = require('core/models')

const runJob = async () => {
  const models = await SpotifyEpisode.objects.all()
  console.log(models)
}

module.exports = {
  runJob
}
```
