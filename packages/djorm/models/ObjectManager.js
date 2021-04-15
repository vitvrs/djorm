const { Select } = require('../db/Select')

class ObjectManager {
  constructor (model) {
    this.model = model
  }

  get db () {
    return this.model.db
  }

  get query () {
    return Select.fromDb(this.db).from(this.model)
  }

  async all () {
    return await this.query.all()
  }

  async first () {
    return await this.query.first()
  }

  async get (filter) {
    return await this.query.filter(filter).first()
  }

  createReadStream () {
    return this.query.createReadStream()
  }

  filter (...args) {
    return this.query.filter(...args)
  }

  orderBy (...args) {
    return this.query.orderBy(...args)
  }
}

module.exports = { ObjectManager }
