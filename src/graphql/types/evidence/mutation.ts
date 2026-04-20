import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { EvidenceMutationResolvers } from '@/graphql/resolvers/evidence'

export const EvidenceMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createEvidence', {
      type: 'Evidence',
      args: {
        entityType: nonNull('EvidenceEntityType'),
        entityId: nonNull(intArg()),
        fileName: nonNull(stringArg()),
        contentType: nonNull(stringArg()),
        base64Data: nonNull(stringArg()),
        label: stringArg(),
      },
      resolve: EvidenceMutationResolvers.createEvidence,
    })

    t.field('updateEvidence', {
      type: 'Evidence',
      args: {
        id: nonNull(intArg()),
        label: stringArg(),
      },
      resolve: EvidenceMutationResolvers.updateEvidence,
    })

    t.field('deleteEvidence', {
      type: 'Evidence',
      args: {
        id: nonNull(intArg()),
      },
      resolve: EvidenceMutationResolvers.deleteEvidence,
    })

    t.field('restoreEvidence', {
      type: 'Evidence',
      args: {
        id: nonNull(intArg()),
      },
      resolve: EvidenceMutationResolvers.restoreEvidence,
    })
  },
})
