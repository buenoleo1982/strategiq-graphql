import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'

export const me: FieldResolver<'Query', 'me'> = async (_, _args, ctx) => {
  if (!ctx.currentUser) {
    throw new GraphQLError('Não autenticado', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.currentUser.id },
  })

  if (!user) {
    throw new GraphQLError('Usuário não encontrado')
  }

  return user
}
