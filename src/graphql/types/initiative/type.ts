import { enumType, inputObjectType, objectType } from 'nexus'
import { OrderDirection, Pagination } from '../utils'

export const InitiativeStatusEnum = enumType({
  name: 'InitiativeStatus',
  members: ['PLANNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'],
})

export const Initiative = objectType({
  name: 'Initiative',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('strategicObjectiveId')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.field('status', { type: InitiativeStatusEnum })
    t.field('dueAt', { type: 'DateTime' })
    t.int('ownerId')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const InitiativeList = objectType({
  name: 'InitiativeList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: Initiative })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const InitiativeArgs = inputObjectType({
  name: 'InitiativeArgs',
  definition(t) {
    t.int('id')
    t.int('strategicObjectiveId')
    t.string('title')
    t.field('status', { type: InitiativeStatusEnum })
    t.int('ownerId')
  },
})

export const InitiativeOrderBy = enumType({
  name: 'InitiativeOrderBy',
  members: ['ID', 'STRATEGIC_OBJECTIVE_ID', 'TITLE', 'STATUS', 'DUE_AT', 'CREATED_AT'],
})

export const InitiativeOrderInput = inputObjectType({
  name: 'InitiativeOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: InitiativeOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
