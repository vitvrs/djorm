const nullishValues = [undefined, null, '']

const isNullish = value => nullishValues.includes(value)

module.exports = { isNullish }
