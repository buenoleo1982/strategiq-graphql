import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { NonConformityMutationResolvers } from '@/graphql/resolvers/non-conformity'

export const NonConformityMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNonConformity', {
      type: 'NonConformity',
      args: {
        title: nonNull(stringArg()),
        description: stringArg(),
        severity: 'NonConformitySeverity',
        status: 'NonConformityStatus',
        source: stringArg(),
        department: stringArg(),
        occurredAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: NonConformityMutationResolvers.createNonConformity,
    })

    t.field('updateNonConformity', {
      type: 'NonConformity',
      args: {
        id: nonNull(intArg()),
        title: stringArg(),
        description: stringArg(),
        severity: 'NonConformitySeverity',
        status: 'NonConformityStatus',
        source: stringArg(),
        department: stringArg(),
        occurredAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: NonConformityMutationResolvers.updateNonConformity,
    })

    t.field('deleteNonConformity', {
      type: 'NonConformity',
      args: {
        id: nonNull(intArg()),
      },
      resolve: NonConformityMutationResolvers.deleteNonConformity,
    })
  },
})
