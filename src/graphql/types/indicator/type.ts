import { enumType, inputObjectType, objectType } from 'nexus'
import { OrderDirection, Pagination } from '../utils'

export const IndicatorFrequencyEnum = enumType({
  name: 'IndicatorFrequency',
  members: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
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
