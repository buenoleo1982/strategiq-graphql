import { enumType, inputObjectType, objectType } from 'nexus'
import { calculateRiskLevel, calculateRiskScore } from '@/service/risks'
import { defineAuditFields, OrderDirection, Pagination } from '../utils'

export const RiskStatusEnum = enumType({
  name: 'RiskStatus',
  members: ['OPEN', 'MONITORING', 'MITIGATED', 'CLOSED'],
})

export const RiskLevelEnum = enumType({
  name: 'RiskLevel',
  members: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
})

export const PreventiveActionStatusEnum = enumType({
  name: 'PreventiveActionStatus',
  members: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
})

export const Risk = objectType({
  name: 'Risk',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('nonConformityId')
    t.nonNull.string('title')
    t.string('description')
    t.string('category')
    t.nonNull.int('probability')
    t.nonNull.int('impact')
    t.nonNull.int('score', {
      resolve: risk => calculateRiskScore(risk.probability, risk.impact),
    })
    t.nonNull.field('level', {
      type: RiskLevelEnum,
      resolve: risk => calculateRiskLevel(risk.probability, risk.impact),
    })
    t.nonNull.field('status', { type: RiskStatusEnum })
    t.field('dueAt', { type: 'DateTime' })
    t.int('ownerId')
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const PreventiveAction = objectType({
  name: 'PreventiveAction',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('riskId')
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.field('status', { type: PreventiveActionStatusEnum })
    t.field('dueAt', { type: 'DateTime' })
    t.field('completedAt', { type: 'DateTime' })
    t.int('ownerId')
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const RiskList = objectType({
  name: 'RiskList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: Risk })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const PreventiveActionList = objectType({
  name: 'PreventiveActionList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: PreventiveAction })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const RiskArgs = inputObjectType({
  name: 'RiskArgs',
  definition(t) {
    t.int('id')
    t.int('nonConformityId')
    t.field('status', { type: RiskStatusEnum })
    t.field('level', { type: RiskLevelEnum })
    t.string('title')
  },
})

export const PreventiveActionArgs = inputObjectType({
  name: 'PreventiveActionArgs',
  definition(t) {
    t.int('id')
    t.int('riskId')
    t.field('status', { type: PreventiveActionStatusEnum })
  },
})

export const RiskOrderBy = enumType({
  name: 'RiskOrderBy',
  members: ['ID', 'NON_CONFORMITY_ID', 'TITLE', 'STATUS', 'DUE_AT', 'CREATED_AT'],
})

export const PreventiveActionOrderBy = enumType({
  name: 'PreventiveActionOrderBy',
  members: ['ID', 'RISK_ID', 'STATUS', 'DUE_AT', 'CREATED_AT'],
})

export const RiskOrderInput = inputObjectType({
  name: 'RiskOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: RiskOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})

export const PreventiveActionOrderInput = inputObjectType({
  name: 'PreventiveActionOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: PreventiveActionOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
