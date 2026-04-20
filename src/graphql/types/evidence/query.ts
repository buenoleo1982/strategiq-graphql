import { extendType } from 'nexus'
import { EvidenceArgs, EvidenceList } from './type'
import { EvidenceQueryResolvers } from '@/graphql/resolvers/evidence'

export const EvidenceQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('evidenceLoad', {
      type: EvidenceList,
      args: {
        filterArgs: EvidenceArgs,
        pageArgs: 'PageArgs',
      },
      resolve: EvidenceQueryResolvers.evidenceLoad,
    })
  },
})
