const { Delete } = require('../db/Delete')
const { Select } = require('../db/Select')

class ObjectManager {
  constructor (model) {
    this.model = model
  }

  get db () {
    return this.model.db
  }

  get delete () {
    return Delete.fromDb(this.db).target(this.model)
  }

  get query () {
    return Select.fromDb(this.db).from(this.model)
  }

  createWriteStream () {
    return this.db.createWriteStream(this.model)
  }

  async all () {
    return await this.query.all()
  }

  async first () {
    return await this.query.first()
  }

  async get (filter) {
    return await this.query.filter(filter).get()
  }

  async count () {
    return await this.query.count()
  }

  stream () {
    return this.query.stream()
  }

  filter (...args) {
    return this.query.filter(...args)
  }

  orderBy (...args) {
    return this.query.orderBy(...args)
  }
}

module.exports = { ObjectManager }
