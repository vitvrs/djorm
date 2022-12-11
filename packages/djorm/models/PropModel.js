class PropModel {
  constructor (props = {}) {
    this.props = props
  }

  getProp (name, defaultValue) {
    const value = this.props[name]
    return value === undefined ? defaultValue : value
  }
}

class ImmutablePropModel extends PropModel {
  setProp (name, value, mutate = false) {
    if (mutate) {
      this.props[name] = value
      return this
    }
    const Model = this.constructor
    return new Model({ ...this.props, [name]: value })
  }

  appendProp (name, ...value) {
    return this.setProp(name, [...this.getProp(name), ...value])
  }

  initProp (name, getValue) {
    if (name in this.props) {
      return this
    }
    return this.setProp(
      name,
      getValue instanceof Function ? getValue() : getValue,
      true
    )
  }
}

module.exports = { PropModel, ImmutablePropModel }
