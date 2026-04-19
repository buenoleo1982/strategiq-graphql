import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { CapaMutationResolvers } from '@/graphql/resolvers/capa'

export const CapaMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createCorrectiveAction', {
      type: 'CorrectiveAction',
      args: {
        nonConformityId: nonNull(intArg()),
        title: nonNull(stringArg()),
        description: stringArg(),
        status: 'CorrectiveActionStatus',
        dueAt: 'DateTime',
        completedAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: CapaMutationResolvers.createCorrectiveAction,
    })

    t.field('updateCorrectiveAction', {
      type: 'CorrectiveAction',
      args: {
        id: nonNull(intArg()),
        nonConformityId: intArg(),
        title: stringArg(),
        description: stringArg(),
        status: 'CorrectiveActionStatus',
        dueAt: 'DateTime',
        completedAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: CapaMutationResolvers.updateCorrectiveAction,
    })

    t.field('deleteCorrectiveAction', {
      type: 'CorrectiveAction',
      args: {
        id: nonNull(intArg()),
      },
      resolve: CapaMutationResolvers.deleteCorrectiveAction,
    })

    t.field('createEffectivenessCheck', {
      type: 'EffectivenessCheck',
      args: {
        correctiveActionId: nonNull(intArg()),
        checkedAt: 'DateTime',
        result: nonNull('EffectivenessResult'),
        notes: stringArg(),
      },
      resolve: CapaMutationResolvers.createEffectivenessCheck,
    })

    t.field('updateEffectivenessCheck', {
      type: 'EffectivenessCheck',
      args: {
        id: nonNull(intArg()),
        correctiveActionId: intArg(),
        checkedAt: 'DateTime',
        result: 'EffectivenessResult',
        notes: stringArg(),
      },
      resolve: CapaMutationResolvers.updateEffectivenessCheck,
    })

    t.field('deleteEffectivenessCheck', {
      type: 'EffectivenessCheck',
      args: {
        id: nonNull(intArg()),
      },
      resolve: CapaMutationResolvers.deleteEffectivenessCheck,
    })
  },
})
