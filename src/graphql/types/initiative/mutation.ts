import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { InitiativeMutationResolvers } from '@/graphql/resolvers/initiative'

export const InitiativeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createInitiative', {
      type: 'Initiative',
      args: {
        strategicObjectiveId: nonNull(intArg()),
        title: nonNull(stringArg()),
        description: stringArg(),
        status: 'InitiativeStatus',
        dueAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: InitiativeMutationResolvers.createInitiative,
    })

    t.field('updateInitiative', {
      type: 'Initiative',
      args: {
        id: nonNull(intArg()),
        strategicObjectiveId: intArg(),
        title: stringArg(),
        description: stringArg(),
        status: 'InitiativeStatus',
        dueAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: InitiativeMutationResolvers.updateInitiative,
    })

    t.field('deleteInitiative', {
      type: 'Initiative',
      args: {
        id: nonNull(intArg()),
      },
      resolve: InitiativeMutationResolvers.deleteInitiative,
    })
  },
})
