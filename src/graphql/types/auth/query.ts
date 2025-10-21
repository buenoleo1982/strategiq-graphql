import { extendType } from 'nexus'
import { AuthQueryResolvers } from '@/graphql/resolvers'

export const AuthQuery = extendType({
  type: 'Query',
  definition(t) {
    // Query para obter o usuário atual autenticado
    t.field('me', {
      type: 'User',
      resolve: AuthQueryResolvers.me,
    })
  },
})
