import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'
import { AuthService } from '@/lib/auth/auth.service'

export const register: FieldResolver<'Mutation', 'register'> = async (
  _,
  { name, email, password },
  ctx
) => {
  ctx.logger.info({ email }, 'Registrando novo usuário')

  // Registra o usuário
  const registeredUser = await AuthService.register(name, email, password)

  // Faz login automático após registro
  const tokens = await AuthService.login({ email, password })

  // Busca usuário completo com timestamps
  const user = await ctx.prisma.user.findUnique({
    where: { id: registeredUser.id },
  })

  if (!user) {
    throw new GraphQLError('Erro ao criar usuário')
  }

  return {
    user,
    tokens,
  }
}
