import { extendType, nonNull, stringArg } from 'nexus'
import { UserMutationResolvers } from '@/graphql/resolvers'

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createUser', {
      type: 'User',
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: UserMutationResolvers.createUser,
    })

    t.field('updateUser', {
      type: 'User',
      args: {
        id: nonNull('Int'),
        name: stringArg(),
        email: stringArg(),
      },
      resolve: UserMutationResolvers.updateUser,
    })

    t.field('deleteUser', {
      type: 'User',
      args: {
        id: nonNull('Int'),
      },
      resolve: UserMutationResolvers.deleteUser,
    })
  },
})
