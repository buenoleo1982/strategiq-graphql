import { inputObjectType, objectType } from 'nexus'


export const PageArgs = inputObjectType({
  name: 'PageArgs',
  definition: t => {
    t.nonNull.int('skip')
    t.nonNull.int('take')
  },
})

export const Pagination = objectType({
  name: 'Pagination',
  definition: t => {
    t.nonNull.int('totalCount')
    t.nonNull.int('page')
    t.nonNull.int('pageSize')
    t.nonNull.boolean('hasMore')
  },
})
