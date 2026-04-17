import { extendType, floatArg, intArg, nonNull, stringArg } from 'nexus'
import { IndicatorMutationResolvers } from '@/graphql/resolvers/indicator'

export const IndicatorMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createIndicator', {
      type: 'Indicator',
      args: {
        name: nonNull(stringArg()),
        description: stringArg(),
        formula: stringArg(),
        unit: stringArg(),
        targetValue: floatArg(),
        frequency: 'IndicatorFrequency',
        ownerId: intArg(),
      },
      resolve: IndicatorMutationResolvers.createIndicator,
    })

    t.field('updateIndicator', {
      type: 'Indicator',
      args: {
        id: nonNull(intArg()),
        name: stringArg(),
        description: stringArg(),
        formula: stringArg(),
        unit: stringArg(),
        targetValue: floatArg(),
        frequency: 'IndicatorFrequency',
        ownerId: intArg(),
      },
      resolve: IndicatorMutationResolvers.updateIndicator,
    })

    t.field('deleteIndicator', {
      type: 'Indicator',
      args: {
        id: nonNull(intArg()),
      },
      resolve: IndicatorMutationResolvers.deleteIndicator,
    })
  },
})
