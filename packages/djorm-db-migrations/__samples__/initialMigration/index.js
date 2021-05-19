const { AutoField } = require('djorm/fields/AutoField')
const { DatabaseModel } = require('djorm/models')
const { DateTimeField } = require('djorm/fields/DateTimeField')
const { ForeignKey } = require('djorm/fields/ForeignKey')
const { CharField } = require('djorm/fields/CharField')
const { PasswordField } = require('djorm/fields/PasswordField')
const { PositiveIntegerField } = require('djorm/fields/PositiveIntegerField')
const { TextField } = require('djorm/fields/TextField')
const { UrlField } = require('djorm/fields/UrlField')

class User extends DatabaseModel {
  static id = new AutoField()
  static firstName = new CharField()
  static lastName = new CharField()
  static password = new PasswordField()
  static email = new CharField({ null: true })
  static homepage = new UrlField({ null: true })
  static about = new TextField({ null: true })
  static visits = new PositiveIntegerField({ default: 0 })
  static createdAt = new DateTimeField()
  static updatedAt = new DateTimeField({ null: true })
}

class Group extends DatabaseModel {
  static id = new AutoField()
  static name = new CharField()

  static meta = class {
    static modelName = 'Group'
  }
}

class UserGroup extends DatabaseModel {
  static id = new AutoField()
  static user = new ForeignKey({ model: 'User', relatedName: 'userGroups' })
  static group = new ForeignKey({ model: 'Group', relatedName: 'userGroups' })
}

Group.register()
User.register()
UserGroup.register()

module.exports = { Group, User, UserGroup }
