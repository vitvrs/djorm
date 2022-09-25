const { ConfigError } = require('./errors')

const resolveClass = classPath => {
  const [module, prop] = classPath.split('.')
  const mod = require(module)
  const Class = prop ? mod[prop] : mod
  if (Class) {
    return Class
  }
  throw new ConfigError(`Failed to resolve "${classPath}" into a class`)
}

const instantiate = (classPath, props) => new (resolveClass(classPath))(props)

const instantiateDriver = ({ driver, ...props }) => instantiate(driver, props)

module.exports = { instantiate, instantiateDriver, resolveClass }
