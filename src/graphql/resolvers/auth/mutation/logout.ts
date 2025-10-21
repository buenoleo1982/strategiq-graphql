import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'
import { AuthService } from '@/lib/auth/auth.service'
import { JWTService } from '@/lib/auth/jwt'

export const logout: FieldResolver<'Mutation', 'logout'> = async (_, _args, ctx) => {
  if (!ctx.currentUser) {
    throw new GraphQLError('Não autenticado', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  const authHeader = ctx.req.headers.authorization || null
  const token = JWTService.extractTokenFromHeader(authHeader)

  if (!token) {
    throw new GraphQLError('Token não fornecido')
  }

  ctx.logger.info({ userId: ctx.currentUser.id }, 'Realizando logout')

  await AuthService.logout(ctx.currentUser.id, token)

  return true
}
