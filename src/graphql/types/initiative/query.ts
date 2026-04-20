import { extendType, intArg } from 'nexus'
import { InitiativeQueryResolvers } from '@/graphql/resolvers/initiative'
import { Initiative, InitiativeArgs, InitiativeList, InitiativeOrderInput } from './type'

export const InitiativeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('initiativeGet', {
      type: Initiative,
      args: {
        id: intArg(),
      },
      resolve: InitiativeQueryResolvers.initiativeGet,
    })

    t.field('initiativeLoad', {
      type: InitiativeList,
      args: {
        filterArgs: InitiativeArgs,
        order: InitiativeOrderInput,
        pageArgs: 'PageArgs',
      },
      resolve: InitiativeQueryResolvers.initiativeLoad,
    })
  },
})
