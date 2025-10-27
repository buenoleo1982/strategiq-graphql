import { enumType, inputObjectType, objectType } from 'nexus'
import { OrderDirection, Pagination } from '../utils'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('name')
    t.nonNull.string('email')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const UserInput = inputObjectType({
  name: 'UserInput',
  definition: t => {
    t.nonNull.string('email')
    t.nonNull.string('name')
    t.nonNull.string('password')
  },
})

export const UserList = objectType({
  name: 'UserList',
  definition: t => {
    t.list.nonNull.field('nodes', { type: User })
    t.nonNull.field('pagination', { type: Pagination })
  },
})


export const UserArgs = inputObjectType({
  name: 'UserArgs',
  definition: t => {
    t.int('id')
    t.string('username')
    t.string('name')
  },
})

export const UserOrderBy = enumType({
  name: 'UserOrderBy',
  members: ['ID', 'USERNAME', 'NAME'],
})

export const UserOrderInput = inputObjectType({
  name: 'UserOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: UserOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})