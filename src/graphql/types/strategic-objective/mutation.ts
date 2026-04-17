import { extendType, intArg, nonNull, stringArg } from 'nexus'
import { StrategicObjectiveMutationResolvers } from '@/graphql/resolvers/strategic-objective'

export const StrategicObjectiveMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createStrategicObjective', {
      type: 'StrategicObjective',
      args: {
        title: nonNull(stringArg()),
        description: stringArg(),
        status: 'StrategicObjectiveStatus',
        priority: 'StrategicObjectivePriority',
        startsAt: 'DateTime',
        endsAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: StrategicObjectiveMutationResolvers.createStrategicObjective,
    })

    t.field('updateStrategicObjective', {
      type: 'StrategicObjective',
      args: {
        id: nonNull(intArg()),
        title: stringArg(),
        description: stringArg(),
        status: 'StrategicObjectiveStatus',
        priority: 'StrategicObjectivePriority',
        startsAt: 'DateTime',
        endsAt: 'DateTime',
        ownerId: intArg(),
      },
      resolve: StrategicObjectiveMutationResolvers.updateStrategicObjective,
    })

    t.field('deleteStrategicObjective', {
      type: 'StrategicObjective',
      args: {
        id: nonNull(intArg()),
      },
      resolve: StrategicObjectiveMutationResolvers.deleteStrategicObjective,
    })
  },
})
