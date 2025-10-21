import { extendType } from 'nexus'
import { UserQueryResolvers } from '@/graphql/resolvers'

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('users', {
      type: 'User',
      resolve: UserQueryResolvers.users,
    })

    t.field('user', {
      type: 'User',
      args: {
        id: 'Int',
      },
      resolve: UserQueryResolvers.user,
    })
  },
})
