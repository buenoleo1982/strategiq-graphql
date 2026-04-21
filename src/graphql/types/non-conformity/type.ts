import { enumType, inputObjectType, objectType } from 'nexus'
import { defineAuditFields, OrderDirection, Pagination } from '../utils'

export const NonConformitySeverityEnum = enumType({
  name: 'NonConformitySeverity',
  members: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
})

export const NonConformityStatusEnum = enumType({
  name: 'NonConformityStatus',
  members: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
})

export const NonConformity = objectType({
  name: 'NonConformity',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.field('severity', { type: NonConformitySeverityEnum })
    t.nonNull.field('status', { type: NonConformityStatusEnum })
    t.string('source')
    t.string('department')
    t.field('occurredAt', { type: 'DateTime' })
    t.int('ownerId')
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const NonConformityList = objectType({
  name: 'NonConformityList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: NonConformity })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const NonConformityArgs = inputObjectType({
  name: 'NonConformityArgs',
  definition(t) {
    t.int('id')
    t.string('title')
    t.field('severity', { type: NonConformitySeverityEnum })
    t.field('status', { type: NonConformityStatusEnum })
    t.string('department')
    t.int('ownerId')
  },
})

export const NonConformityOrderBy = enumType({
  name: 'NonConformityOrderBy',
  members: ['ID', 'TITLE', 'SEVERITY', 'STATUS', 'OCCURRED_AT', 'CREATED_AT'],
})

export const NonConformityOrderInput = inputObjectType({
  name: 'NonConformityOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: NonConformityOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
