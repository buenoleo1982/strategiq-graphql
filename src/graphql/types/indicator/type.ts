import { enumType, inputObjectType, objectType } from 'nexus'
import { defineAuditFields, OrderDirection, Pagination } from '../utils'

type IndicatorWithLatestEntry = {
  targetValue?: number | null
  entries?: Array<{
    value: number
    collectedAt: Date
  }>
}

export const IndicatorFrequencyEnum = enumType({
  name: 'IndicatorFrequency',
  members: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
})

export const IndicatorTargetStatusEnum = enumType({
  name: 'IndicatorTargetStatus',
  members: ['ON_TARGET', 'BELOW_TARGET', 'NO_TARGET', 'NO_DATA'],
})

export const Indicator = objectType({
  name: 'Indicator',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('name')
    t.string('description')
    t.string('formula')
    t.string('unit')
    t.float('targetValue')
    t.nonNull.field('frequency', { type: IndicatorFrequencyEnum })
    t.int('ownerId')
    t.float('latestEntryValue', {
      resolve: indicator => (indicator as IndicatorWithLatestEntry).entries?.[0]?.value ?? null,
    })
    t.field('latestEntryCollectedAt', {
      type: 'DateTime',
      resolve: indicator => (indicator as IndicatorWithLatestEntry).entries?.[0]?.collectedAt ?? null,
    })
    t.nonNull.field('latestEntryStatus', {
      type: IndicatorTargetStatusEnum,
      resolve: indicator => {
        const indicatorWithLatestEntry = indicator as IndicatorWithLatestEntry
        const latestEntry = indicatorWithLatestEntry.entries?.[0]

        if (!latestEntry) {
          return 'NO_DATA'
        }

        if (
          indicatorWithLatestEntry.targetValue === null ||
          indicatorWithLatestEntry.targetValue === undefined
        ) {
          return 'NO_TARGET'
        }

        return latestEntry.value >= indicatorWithLatestEntry.targetValue ? 'ON_TARGET' : 'BELOW_TARGET'
      },
    })
    defineAuditFields(t)
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const IndicatorList = objectType({
  name: 'IndicatorList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: Indicator })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const IndicatorArgs = inputObjectType({
  name: 'IndicatorArgs',
  definition(t) {
    t.int('id')
    t.string('name')
    t.field('frequency', { type: IndicatorFrequencyEnum })
    t.int('ownerId')
  },
})

export const IndicatorOrderBy = enumType({
  name: 'IndicatorOrderBy',
  members: ['ID', 'NAME', 'FREQUENCY', 'TARGET_VALUE', 'CREATED_AT'],
})

export const IndicatorOrderInput = inputObjectType({
  name: 'IndicatorOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: IndicatorOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
