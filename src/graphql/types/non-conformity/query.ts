import { arg, extendType, intArg, nonNull } from 'nexus'
import { NonConformityQueryResolvers } from '@/graphql/resolvers/non-conformity'
import { PageArgs } from '../utils'
import { NonConformity, NonConformityArgs, NonConformityList, NonConformityOrderInput } from './type'

export const NonConformityQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('nonConformityGet', {
      type: NonConformity,
      args: {
        id: nonNull(intArg()),
      },
      resolve: NonConformityQueryResolvers.nonConformityGet,
    })

    t.field('nonConformityLoad', {
      type: NonConformityList,
      args: {
        filterArgs: arg({ type: NonConformityArgs }),
        order: arg({ type: NonConformityOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: NonConformityQueryResolvers.nonConformityLoad,
    })
  },
})
