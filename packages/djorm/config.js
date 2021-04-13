let currentConfig = {
  databases: {}
}

const configure = config => {
  currentConfig = config
}

module.exports = {
  configure,
  get settings () {
    return currentConfig
  }
}
