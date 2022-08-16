const { Field } = require('../models/AttrModel')

module.exports = {
  ...require('./ArrayField'),
  ...require('./AutoField'),
  ...require('./BooleanField'),
  ...require('./CharField'),
  ...require('./DateField'),
  ...require('./DateTimeField'),
  ...require('./EmailField'),
  ...require('./FileField'),
  ...require('./FloatField'),
  ...require('./ForeignKey'),
  ...require('./IntegerField'),
  ...require('./JsonField'),
  ...require('./ObjectField'),
  ...require('./ObjectArrayField'),
  ...require('./PasswordField'),
  ...require('./PositiveIntegerField'),
  ...require('./TextField'),
  ...require('./TrivialField'),
  ...require('./UrlField'),
  Field
}
