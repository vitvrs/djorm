const getOrThrow = (collection, itemName, ErrorClass = Error) => {
  const item = collection[itemName]
  if (!item) {
    throw new ErrorClass(`"${itemName}" is not available`)
  }
  return item
}

class Hub {
  ErrorClass = Error
  ItemClass = Object
  instances = {}

  addInstances = instanceMap => {
    for (const [name, config] of Object.entries(instanceMap)) {
      this.addInstance(this.ItemClass.resolveDriver(config), name)
    }
  }

  addInstance = (instance, name = 'default') => {
    if (instance instanceof this.ItemClass) {
      const existing = this.instances[name]
      if (existing) {
        this.destroyInstance(existing)
      }
      this.instances[name] = instance
    } else {
      throw new this.ErrorClass(`"${name}" must be instance of Database`)
    }
  }

  all = fn => Promise.all(Object.values(this.instances).map(fn))
  destroyInstance = () => {}
  destroy = () => this.all(this.destroyInstance)
  get = name => getOrThrow(this.instances, name, this.ErrorClass)
  initInstance = () => {}
  init = () => this.all(this.initInstance)
}

module.exports = { Hub }
