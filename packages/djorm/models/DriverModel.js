const { instantiateDriver } = require('../drivers')
const { PropModel } = require('./PropModel')

class DriverModel extends PropModel {
  static resolveDriver = instantiateDriver
}

module.exports = { DriverModel }
