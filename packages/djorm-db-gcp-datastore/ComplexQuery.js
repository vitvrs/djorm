class ComplexQuery {
  constructor (fn) {
    this.query = fn
  }

  async run () {
    return await this.query()
  }
}

module.exports = { ComplexQuery }
