# `djorm-cloud-jobs`

Tiny library that helps you run huge workloads as small distributed jobs in cloud environment.

For the moment, only Google Cloud Platform is supported.

## Installation

```
npm install djorm-cloud-jobs
```

## Configuration

Add `djorm-cloud-jobs/config` to [`apps` djorm config](../../docs/configuration.md).

```
const { configure } = require('djorm/config')

configure({
  apps: [
    'djorm-cloud-jobs/config'
  ], 
  jobs: {
    model: 'djorm-cloud-jobs.Job',
    local: process.env.NODE_ENV === 'local'
  }
})
```

### `jobs.model`

(string, default `'gcpi-models-jobs.Job'`) name of the model used to store jobs. You can either use the [`Job`](./models.js) model or extend the abstract [`JobBase`](./models.js) model.

### `jobs.local`

(boolean, default `false`) run the jobs locally (don't use that in production)

## Usage

The jobs are expected to be run in Cloud Function environment. So first, you need to create an entrypoint.

```javascript
const { createSubscription } = require('djorm-cloud-jobs')

module.exports = createSubscription({
  filename: __filename,
  topic: 'job-topic',
  tasks: job => {
    // process job.props
  }
})
```

The processing stores updates job status based on the outcome of the processing function.

### Multiple job types

You can specify that the entrypoint will process multiple different types of Jobs. Good examples are scrapers, so let's scrape some pets API.

```javascript
const { createSubscription } = require('djorm-cloud-jobs')

const ScrapeTriggers = {
  ownerList: 'load:owner:all', 
  ownerDetail: 'load:owner:detail',
  ownerPetList: 'load:owner:pet:all'
}

module.exports = createSubscription({
  filename: __filename,
  topic: 'job-topic',
  tasks: {
    [ScrapeTriggers.ownerList]: job => {
      // Fetch owner list and trigger details fetch for each owner
      await Promise.all(ownerList.map(owner => 
        job.spawnChild({
          props: {
            owner
          }
        })
      )
    },
    [ScrapeTriggers.ownerDetail]: job => {
      const { owner } = job.props
      // Fetch owner details for a specific owner
      // Store owner details
      // Trigger pets details fetch for each pet
      await Promise.all(owner.pets.map(pet => 
        job.spawnChild({
          props: {
            owner,
            pet
          }
        })
      )

    },
    [ScrapeTriggers.ownerPetList]: job => {
      const { owner, pet } = job.props
      // Now fetch and store the owner's pet's details
    }
  }
})
```

### Job hooks

To make the jobs interact with each other, you can define hooks. Let's consider `ScrapeTriggers` from previous example. We want to trigger another job when the `ScrapeTriggers.ownerList` job ends successfully. Please note that it is considered successful only if all the descendants finish with success status.

```javascript
const { createSubscription } = require('djorm-cloud-jobs')

const LocationTriggers = {
  petLocationHistory: 'load:pet:location-history'
}

module.exports = createSubscription({
  filename: __filename,
  topic: 'job-topic',
  tasks: {
    [ScrapeTriggers.ownerList]: {
      onRequest: job => {
        // Same as above
      },
      onSuccess: job => {
        job.constructor.debounce({
          type: LocationTriggers.fetchPetLocationHistory,
        })
      }
    }
  }
})
```

## Deploying

1. You need to create all the PubSub topics
2. You need to create all the Cloud Functions with
  - all the required database env variables
  - entrypoint set to `runJob`
3. Potentially other resources
