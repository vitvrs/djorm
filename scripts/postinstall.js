const {
  installDatastore,
  installSdk
} = require('../packages/__jest__/datastore')

const main = async () => {
  try {
    await installSdk()
    await installDatastore()
  } catch (e) {
    console.error(e)
    process.exit(255)
  }
}

main()
