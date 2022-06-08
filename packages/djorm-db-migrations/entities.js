const { AttrModel } = require('djorm')
const { Field } = require('djorm/models/AttrModel')
const { CharField } = require('djorm/fields/CharField')
const { ObjectArrayField } = require('djorm/fields/ObjectArrayField')
const { ObjectField } = require('djorm/fields/ObjectField')

class PropertyOperation extends AttrModel {
  static property = new CharField()
}

class PropertyStructuralOperation extends PropertyOperation {
  static field = new ObjectField({ model: Field })
}

class EntityOperation extends AttrModel {
  static model = new CharField()
}

class LinkOperation extends PropertyOperation {}
class LinkStructuralOperation extends LinkOperation {
  static target = new CharField()
}

class EntityStructuralOperation extends EntityOperation {
  static operations = new ObjectArrayField({ model: PropertyOperation })
}

class CreateProperty extends PropertyStructuralOperation {}
class ModifyProperty extends PropertyStructuralOperation {}
class DeleteProperty extends PropertyOperation {}
class RenameProperty extends PropertyOperation {
  static name = new CharField()
}

class CreateEntity extends EntityStructuralOperation {}
class ModifyEntity extends EntityStructuralOperation {}
class DeleteEntity extends EntityOperation {}
class RenameEntity extends EntityOperation {
  static name = new CharField()
}

class CreateLink extends LinkStructuralOperation {}
class ModifyLink extends LinkStructuralOperation {}
class DeleteLink extends LinkOperation {}
class RenameLink extends LinkOperation {
  static name = new CharField()
}

module.exports = {
  CreateEntity,
  CreateProperty,
  DeleteEntity,
  DeleteProperty,
  EntityOperation,
  ModifyEntity,
  ModifyProperty,
  PropertyOperation,
  RenameEntity,
  CreateLink,
  DeleteLink,
  ModifyLink,
  RenameLink,
  RenameProperty
}
