const { IntegerField } = require('./IntegerField')

/** Field used for non negative integer values */
class PositiveIntegerField extends IntegerField {}

module.exports = { PositiveIntegerField }
