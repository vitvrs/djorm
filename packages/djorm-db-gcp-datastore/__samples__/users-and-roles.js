/* istanbul ignore file */

const user = [
  {
    id: 1,
    name: 'Harmony Vasquez',
    email: 'harmony.vasquez@gmail.com',
    superuser: false,
    inactive: false
  },
  {
    id: 2,
    name: 'Jasper Fraley',
    email: 'jasper.fraley@seznam.cz',
    superuser: true,
    inactive: false
  },
  {
    id: 3,
    name: 'Neil Henry',
    email: 'neil.henry@iol.com',
    superuser: false,
    inactive: true
  },
  {
    id: 4,
    name: 'Merver Chin',
    email: 'merver.chin@gmail.com',
    superuser: true,
    inactive: false
  }
]

const role = [
  { id: 1, name: 'Staff' },
  { id: 2, name: 'Contractor' },
  { id: 3, name: 'Admin' }
]

const userrole = [
  { id: 1, roleId: 1, userId: 1 },
  { id: 2, roleId: 2, userId: 1 },
  { id: 3, roleId: 3, userId: 2 }
]

module.exports = { user, role, userrole }
