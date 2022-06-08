const path = require('path')
const tmp = require('tmp-promise')
const dateMock = require('jest-date-mock')

const { SELF } = require('djorm/models')
const {
  CreateEntity,
  CreateLink,
  CreateProperty,
  DatabaseMigration,
  createInitialMigration
} = require('..')
const {
  AutoField,
  DateTimeField,
  CharField,
  ForeignKey,
  PasswordField,
  PositiveIntegerField,
  TextField,
  UrlField
} = require('djorm/fields')

describe('migration util', () => {
  const appPath = path.resolve(
    __dirname,
    '..',
    '__samples__',
    'initialMigration'
  )
  let dbFile

  beforeEach(async () => {
    require(appPath)
    dateMock.advanceTo(new Date(Date.UTC(2020, 4, 19, 15, 23, 31)))
    dbFile = await tmp.file()
    require('djorm/config').configure({
      databases: {
        driver: 'djorm-db-sqlite',
        path: dbFile.path
      }
    })
  })

  afterEach(async () => {
    dateMock.clear()
    await dbFile.cleanup()
  })

  it('generates app initial migration', () => {
    const migration = createInitialMigration(appPath)
    expect(migration).toEqual(
      new DatabaseMigration({
        identifier: '0001_auto_initial_2020-05-19T15:23:31',
        operations: [
          new CreateEntity({
            model: 'Group',
            operations: [
              new CreateProperty({
                property: 'name',
                field: new CharField()
              }),
              new CreateProperty({ property: 'id', field: new AutoField() })
            ]
          }),
          new CreateEntity({
            model: 'User',
            operations: [
              new CreateProperty({ property: 'id', field: new AutoField() }),
              new CreateProperty({
                property: 'firstName',
                field: new CharField()
              }),
              new CreateProperty({
                property: 'lastName',
                field: new CharField()
              }),
              new CreateProperty({
                property: 'password',
                field: new PasswordField()
              }),
              new CreateProperty({
                property: 'email',
                field: new CharField({ null: true })
              }),
              new CreateProperty({
                property: 'homepage',
                field: new UrlField({ null: true })
              }),
              new CreateProperty({
                property: 'about',
                field: new TextField({ null: true })
              }),
              new CreateProperty({
                property: 'visits',
                field: new PositiveIntegerField({ default: 0 })
              }),
              new CreateProperty({
                property: 'createdAt',
                field: new DateTimeField()
              }),
              new CreateProperty({
                property: 'updatedAt',
                field: new DateTimeField({ null: true })
              })
            ]
          }),
          new CreateEntity({
            model: 'UserGroup',
            operations: [
              new CreateProperty({ property: 'id', field: new AutoField() }),
              new CreateProperty({
                property: 'user',
                field: new ForeignKey({
                  model: 'User',
                  parentModel: SELF,
                  relatedName: 'userGroups'
                })
              }),
              new CreateProperty({
                property: 'userId',
                field: new PositiveIntegerField()
              }),
              new CreateProperty({
                property: 'group',
                field: new ForeignKey({
                  model: 'Group',
                  parentModel: SELF,
                  relatedName: 'userGroups'
                })
              }),
              new CreateProperty({
                property: 'groupId',
                field: new PositiveIntegerField()
              }),
              new CreateLink({
                property: 'userId',
                target: 'User__id'
              }),
              new CreateLink({
                property: 'groupId',
                target: 'Group__id'
              })
            ]
          })
        ]
      })
    )
  })
})
