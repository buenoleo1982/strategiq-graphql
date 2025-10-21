import type { FieldResolver } from 'nexus'
import { requireOwnership } from '@/lib/auth/guards'

export const updateUser: FieldResolver<'Mutation', 'updateUser'> = async (_, args, ctx) => {
  // Verifica se é o próprio usuário
  requireOwnership(ctx, args.id)

  return ctx.prisma.user.update({
    where: { id: args.id },
    data: {
      ...(args.name && { name: args.name }),
      ...(args.email && { email: args.email }),
    },
  })
}
