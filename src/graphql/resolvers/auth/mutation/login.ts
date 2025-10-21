import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'
import { AuthService } from '@/lib/auth/auth.service'

export const login: FieldResolver<'Mutation', 'login'> = async (_, { email, password }, ctx) => {
  ctx.logger.info({ email }, 'Tentativa de login')

  const tokens = await AuthService.login({ email, password })

  // Busca dados do usuário
  const user = await ctx.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new GraphQLError('Usuário não encontrado')
  }

  ctx.logger.info({ userId: user.id }, 'Login realizado com sucesso')

  return {
    user,
    tokens,
  }
}
