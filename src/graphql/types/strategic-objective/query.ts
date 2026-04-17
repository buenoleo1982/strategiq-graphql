import { arg, extendType, intArg, nonNull } from 'nexus'
import { StrategicObjectiveQueryResolvers } from '@/graphql/resolvers/strategic-objective'
import { PageArgs } from '../utils'
import {
  StrategicObjective,
  StrategicObjectiveArgs,
  StrategicObjectiveList,
  StrategicObjectiveOrderInput,
} from './type'

export const StrategicObjectiveQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('strategicObjectiveGet', {
      type: StrategicObjective,
      args: {
        id: nonNull(intArg()),
      },
      resolve: StrategicObjectiveQueryResolvers.strategicObjectiveGet,
    })

    t.field('strategicObjectiveLoad', {
      type: StrategicObjectiveList,
      args: {
        filterArgs: arg({ type: StrategicObjectiveArgs }),
        order: arg({ type: StrategicObjectiveOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: StrategicObjectiveQueryResolvers.strategicObjectiveLoad,
    })
  },
})
