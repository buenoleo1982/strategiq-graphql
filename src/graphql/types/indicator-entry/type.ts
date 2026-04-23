import { enumType, inputObjectType, objectType } from 'nexus'
import { OrderDirection, Pagination } from '../utils'

export const IndicatorEntry = objectType({
  name: 'IndicatorEntry',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('indicatorId')
    t.nonNull.float('value')
    t.nonNull.field('collectedAt', { type: 'DateTime' })
    t.string('source')
    t.string('notes')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const IndicatorEntryList = objectType({
  name: 'IndicatorEntryList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: IndicatorEntry })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const IndicatorEntryCsvImportError = objectType({
  name: 'IndicatorEntryCsvImportError',
  definition(t) {
    t.nonNull.int('row')
    t.nonNull.string('message')
  },
})

export const IndicatorEntryCsvImportResult = objectType({
  name: 'IndicatorEntryCsvImportResult',
  definition(t) {
    t.nonNull.int('importedCount')
    t.list.nonNull.field('entries', { type: IndicatorEntry })
    t.list.nonNull.field('errors', { type: IndicatorEntryCsvImportError })
  },
})

export const IndicatorEntryArgs = inputObjectType({
  name: 'IndicatorEntryArgs',
  definition(t) {
    t.int('id')
    t.int('indicatorId')
    t.string('source')
  },
})

export const IndicatorEntryOrderBy = enumType({
  name: 'IndicatorEntryOrderBy',
  members: ['ID', 'INDICATOR_ID', 'VALUE', 'COLLECTED_AT', 'CREATED_AT'],
})

export const IndicatorEntryOrderInput = inputObjectType({
  name: 'IndicatorEntryOrderInput',
  definition(t) {
    t.nonNull.field('column', { type: IndicatorEntryOrderBy })
    t.nonNull.field('direction', { type: OrderDirection, default: 'ASC' })
  },
})
