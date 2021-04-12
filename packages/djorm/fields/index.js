const { Field } = require('../models/AttrModel')

module.exports = {
  ...require('./BooleanField'),
  ...require('./CharField'),
  ...require('./DateTimeField'),
  ...require('./FileField'),
  ...require('./ForeignKey'),
  ...require('./IntegerField'),
  ...require('./ObjectField'),
  ...require('./PositiveIntegerField'),
  ...require('./TrivialField'),
  ...require('./UrlField'),
  Field
}
