import { arg, extendType, intArg, nonNull } from 'nexus'
import { CapaQueryResolvers } from '@/graphql/resolvers/capa'
import { PageArgs } from '../utils'
import {
  CorrectiveAction,
  CorrectiveActionArgs,
  CorrectiveActionList,
  CorrectiveActionOrderInput,
  EffectivenessCheck,
  EffectivenessCheckArgs,
  EffectivenessCheckList,
  EffectivenessCheckOrderInput,
} from './type'

export const CapaQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('correctiveActionGet', {
      type: CorrectiveAction,
      args: {
        id: nonNull(intArg()),
      },
      resolve: CapaQueryResolvers.correctiveActionGet,
    })

    t.field('correctiveActionLoad', {
      type: CorrectiveActionList,
      args: {
        filterArgs: arg({ type: CorrectiveActionArgs }),
        order: arg({ type: CorrectiveActionOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: CapaQueryResolvers.correctiveActionLoad,
    })

    t.field('effectivenessCheckGet', {
      type: EffectivenessCheck,
      args: {
        id: nonNull(intArg()),
      },
      resolve: CapaQueryResolvers.effectivenessCheckGet,
    })

    t.field('effectivenessCheckLoad', {
      type: EffectivenessCheckList,
      args: {
        filterArgs: arg({ type: EffectivenessCheckArgs }),
        order: arg({ type: EffectivenessCheckOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: CapaQueryResolvers.effectivenessCheckLoad,
    })
  },
})
