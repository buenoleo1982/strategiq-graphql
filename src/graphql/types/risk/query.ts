import { arg, extendType, intArg, nonNull } from 'nexus'
import { RiskQueryResolvers } from '@/graphql/resolvers/risk'
import { PageArgs } from '../utils'
import {
  PreventiveAction,
  PreventiveActionArgs,
  PreventiveActionList,
  PreventiveActionOrderInput,
  Risk,
  RiskArgs,
  RiskList,
  RiskOrderInput,
} from './type'

export const RiskQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('riskGet', {
      type: Risk,
      args: {
        id: nonNull(intArg()),
      },
      resolve: RiskQueryResolvers.riskGet,
    })

    t.field('riskLoad', {
      type: RiskList,
      args: {
        filterArgs: arg({ type: RiskArgs }),
        order: arg({ type: RiskOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: RiskQueryResolvers.riskLoad,
    })

    t.field('preventiveActionGet', {
      type: PreventiveAction,
      args: {
        id: nonNull(intArg()),
      },
      resolve: RiskQueryResolvers.preventiveActionGet,
    })

    t.field('preventiveActionLoad', {
      type: PreventiveActionList,
      args: {
        filterArgs: arg({ type: PreventiveActionArgs }),
        order: arg({ type: PreventiveActionOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: RiskQueryResolvers.preventiveActionLoad,
    })
  },
})
