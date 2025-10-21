import { extendType, nonNull, stringArg } from 'nexus'
import { AuthMutationResolvers } from '@/graphql/resolvers'

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    // Registro de usuário
    t.nonNull.field('register', {
      type: 'AuthResponse',
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: AuthMutationResolvers.register,
    })

    // Login
    t.nonNull.field('login', {
      type: 'AuthResponse',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: AuthMutationResolvers.login,
    })

    // Logout
    t.nonNull.boolean('logout', {
      resolve: AuthMutationResolvers.logout,
    })

    // Refresh token
    t.nonNull.field('refreshToken', {
      type: 'AuthTokens',
      args: {
        refreshToken: nonNull(stringArg()),
      },
      resolve: AuthMutationResolvers.refreshToken,
    })
  },
})
