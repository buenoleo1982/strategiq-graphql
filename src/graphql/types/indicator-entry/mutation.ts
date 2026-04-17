import { extendType, floatArg, intArg, nonNull, stringArg } from 'nexus'
import { IndicatorEntryMutationResolvers } from '@/graphql/resolvers/indicator-entry'

export const IndicatorEntryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createIndicatorEntry', {
      type: 'IndicatorEntry',
      args: {
        indicatorId: nonNull(intArg()),
        value: nonNull(floatArg()),
        collectedAt: 'DateTime',
        source: stringArg(),
        notes: stringArg(),
      },
      resolve: IndicatorEntryMutationResolvers.createIndicatorEntry,
    })

    t.field('updateIndicatorEntry', {
      type: 'IndicatorEntry',
      args: {
        id: nonNull(intArg()),
        indicatorId: intArg(),
        value: floatArg(),
        collectedAt: 'DateTime',
        source: stringArg(),
        notes: stringArg(),
      },
      resolve: IndicatorEntryMutationResolvers.updateIndicatorEntry,
    })

    t.field('deleteIndicatorEntry', {
      type: 'IndicatorEntry',
      args: {
        id: nonNull(intArg()),
      },
      resolve: IndicatorEntryMutationResolvers.deleteIndicatorEntry,
    })
  },
})
