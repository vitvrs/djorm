const { Field } = require('../models/AttrModel')

module.exports = {
  ...require('./BooleanField'),
  ...require('./CharField'),
  ...require('./DateTimeField'),
  ...require('./FileField'),
  ...require('./ForeignKey'),
  ...require('./IntegerField'),
  ...require('./JsonField'),
  ...require('./ObjectField'),
  ...require('./PasswordField'),
  ...require('./PositiveIntegerField'),
  ...require('./TextField'),
  ...require('./TrivialField'),
  ...require('./UrlField'),
  Field
}
