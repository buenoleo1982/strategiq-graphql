import { extendType, intArg, nonNull } from 'nexus'
import { EvidenceMutationResolvers } from '@/graphql/resolvers/evidence'

export const EvidenceMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteEvidence', {
      type: 'Evidence',
      args: {
        id: nonNull(intArg()),
      },
      resolve: EvidenceMutationResolvers.deleteEvidence,
    })
  },
})
