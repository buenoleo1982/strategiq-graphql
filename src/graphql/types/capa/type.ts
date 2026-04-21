import { enumType, inputObjectType, objectType } from 'nexus'
import { defineAuditFields, OrderDirection, Pagination } from '../utils'

export const CorrectiveActionStatusEnum = enumType({
  name: 'CorrectiveActionStatus',
  members: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
})

export const EffectivenessResultEnum = enumType({
  name: 'EffectivenessResult',
  members: ['EFFECTIVE', 'INEFFECTIVE', 'NEEDS_MONITORING'],
})

export const CorrectiveAction = objectType({
  name: 'CorrectiveAction',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('nonConformityId')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.field('status', { type: CorrectiveActionStatusEnum })
    t.field('dueAt', { type: 'DateTime' })
    t.field('completedAt', { type: 'DateTime' })
    t.int('ownerId')
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const EffectivenessCheck = objectType({
  name: 'EffectivenessCheck',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('correctiveActionId')
    t.nonNull.field('checkedAt', { type: 'DateTime' })
    t.nonNull.field('result', { type: EffectivenessResultEnum })
    t.string('notes')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const CorrectiveActionList = objectType({
  name: 'CorrectiveActionList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: CorrectiveAction })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const EffectivenessCheckList = objectType({
  name: 'EffectivenessCheckList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: EffectivenessCheck })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const CorrectiveActionArgs = inputObjectType({
  name: 'CorrectiveActionArgs',
  definition(t) {
    t.int('id')
    t.int('nonConformityId')
    t.field('status', { type: CorrectiveActionStatusEnum })
    t.int('ownerId')
  },
})

export const EffectivenessCheckArgs = inputObjectType({
  name: 'EffectivenessCheckArgs',
  definition(t) {
    t.int('id')
    t.int('correctiveActionId')
    t.field('result', { type: EffectivenessResultEnum })
  },
})

export const CorrectiveActionOrderBy = enumType({
  name: 'CorrectiveActionOrderBy',
  members: ['ID', 'NON_CONFORMITY_ID', 'STATUS', 'DUE_AT', 'CREATED_AT'],
})

export const EffectivenessCheckOrderBy = enumType({
  name: 'EffectivenessCheckOrderBy',
  members: ['ID', 'CORRECTIVE_ACTION_ID', 'CHECKED_AT', 'RESULT', 'CREATED_AT'],
})

export const CorrectiveActionOrderInput = inputObjectType({
  name: 'CorrectiveActionOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: CorrectiveActionOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})

export const EffectivenessCheckOrderInput = inputObjectType({
  name: 'EffectivenessCheckOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: EffectivenessCheckOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
