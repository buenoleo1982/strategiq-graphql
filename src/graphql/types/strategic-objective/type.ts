import { enumType, inputObjectType, objectType } from 'nexus'
import { resolveStrategicObjectiveTimeline } from '@/service/timeline'
import { defineAuditFields, OrderDirection, Pagination } from '../utils'

export const StrategicObjectiveStatusEnum = enumType({
  name: 'StrategicObjectiveStatus',
  members: ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
})

export const StrategicObjectivePriorityEnum = enumType({
  name: 'StrategicObjectivePriority',
  members: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
})

export const StrategicObjective = objectType({
  name: 'StrategicObjective',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.field('status', { type: StrategicObjectiveStatusEnum })
    t.nonNull.field('priority', { type: StrategicObjectivePriorityEnum })
    t.field('startsAt', { type: 'DateTime' })
    t.field('endsAt', { type: 'DateTime' })
    t.int('ownerId')
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.list.nonNull.field('timeline', {
      type: 'TimelineEvent',
      resolve: (root, _args, ctx) => resolveStrategicObjectiveTimeline(ctx.prisma, root.id),
    })
  },
})

export const StrategicObjectiveList = objectType({
  name: 'StrategicObjectiveList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: StrategicObjective })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const StrategicObjectiveArgs = inputObjectType({
  name: 'StrategicObjectiveArgs',
  definition(t) {
    t.int('id')
    t.string('title')
    t.field('status', { type: StrategicObjectiveStatusEnum })
    t.field('priority', { type: StrategicObjectivePriorityEnum })
    t.int('ownerId')
  },
})

export const StrategicObjectiveOrderBy = enumType({
  name: 'StrategicObjectiveOrderBy',
  members: ['ID', 'TITLE', 'STATUS', 'PRIORITY', 'STARTS_AT', 'ENDS_AT', 'CREATED_AT'],
})

export const StrategicObjectiveOrderInput = inputObjectType({
  name: 'StrategicObjectiveOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: StrategicObjectiveOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
