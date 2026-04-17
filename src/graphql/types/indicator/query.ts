import { arg, extendType, intArg, nonNull } from 'nexus'
import { IndicatorQueryResolvers } from '@/graphql/resolvers/indicator'
import { PageArgs } from '../utils'
import { Indicator, IndicatorArgs, IndicatorList, IndicatorOrderInput } from './type'

export const IndicatorQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('indicatorGet', {
      type: Indicator,
      args: {
        id: nonNull(intArg()),
      },
      resolve: IndicatorQueryResolvers.indicatorGet,
    })

    t.field('indicatorLoad', {
      type: IndicatorList,
      args: {
        filterArgs: arg({ type: IndicatorArgs }),
        order: arg({ type: IndicatorOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: IndicatorQueryResolvers.indicatorLoad,
    })
  },
})
