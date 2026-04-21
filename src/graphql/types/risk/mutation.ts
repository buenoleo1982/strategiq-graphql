import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { RiskMutationResolvers } from '@/graphql/resolvers/risk'

export const RiskMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createRisk', {
      type: 'Risk',
      args: {
        nonConformityId: nonNull(intArg()),
        title: nonNull(stringArg()),
        description: stringArg(),
        category: stringArg(),
        probability: nonNull(intArg()),
        impact: nonNull(intArg()),
        status: 'RiskStatus',
        dueAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: RiskMutationResolvers.createRisk,
    })

    t.field('updateRisk', {
      type: 'Risk',
      args: {
        id: nonNull(intArg()),
        nonConformityId: intArg(),
        title: stringArg(),
        description: stringArg(),
        category: stringArg(),
        probability: intArg(),
        impact: intArg(),
        status: 'RiskStatus',
        dueAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: RiskMutationResolvers.updateRisk,
    })

    t.field('deleteRisk', {
      type: 'Risk',
      args: {
        id: nonNull(intArg()),
      },
      resolve: RiskMutationResolvers.deleteRisk,
    })

    t.field('createPreventiveAction', {
      type: 'PreventiveAction',
      args: {
        riskId: nonNull(intArg()),
        title: nonNull(stringArg()),
        description: stringArg(),
        status: 'PreventiveActionStatus',
        dueAt: 'DateTime',
        completedAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: RiskMutationResolvers.createPreventiveAction,
    })

    t.field('updatePreventiveAction', {
      type: 'PreventiveAction',
      args: {
        id: nonNull(intArg()),
        riskId: intArg(),
        title: stringArg(),
        description: stringArg(),
        status: 'PreventiveActionStatus',
        dueAt: 'DateTime',
        completedAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: RiskMutationResolvers.updatePreventiveAction,
    })

    t.field('deletePreventiveAction', {
      type: 'PreventiveAction',
      args: {
        id: nonNull(intArg()),
      },
      resolve: RiskMutationResolvers.deletePreventiveAction,
    })
  },
})
