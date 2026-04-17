import { arg, extendType, intArg, nonNull } from 'nexus'
import { IndicatorEntryQueryResolvers } from '@/graphql/resolvers/indicator-entry'
import { PageArgs } from '../utils'
import {
  IndicatorEntry,
  IndicatorEntryArgs,
  IndicatorEntryList,
  IndicatorEntryOrderInput,
} from './type'

export const IndicatorEntryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('indicatorEntryGet', {
      type: IndicatorEntry,
      args: {
        id: nonNull(intArg()),
      },
      resolve: IndicatorEntryQueryResolvers.indicatorEntryGet,
    })

    t.field('indicatorEntryLoad', {
      type: IndicatorEntryList,
      args: {
        filterArgs: arg({ type: IndicatorEntryArgs }),
        order: arg({ type: IndicatorEntryOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: IndicatorEntryQueryResolvers.indicatorEntryLoad,
    })
  },
})
