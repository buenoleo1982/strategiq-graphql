import { userGet, userLoad } from '@/graphql/resolvers/user/query'
import { arg, extendType, intArg, nonNull } from 'nexus'
import { PageArgs } from '../utils'
import { User, UserArgs, UserList, UserOrderInput } from './type'

export const UserQuery = extendType({
  type: 'Query',
  definition: t => {
    t.field('userGet', {
      type: User,
      args: { id: nonNull(intArg()) },
      resolve: userGet,
    })

    t.field('userLoad', {
      type: UserList,
      args: {
        filterArgs: arg({ type: UserArgs }),
        order: arg({ type: UserOrderInput }),
        pageArgs: arg({ type: PageArgs }),
      },
      resolve: userLoad,
    })
  },
})