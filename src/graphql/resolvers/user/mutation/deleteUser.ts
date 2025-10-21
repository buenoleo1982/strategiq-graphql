import type { FieldResolver } from 'nexus'
import { requireOwnership } from '@/lib/auth/guards'

export const deleteUser: FieldResolver<'Mutation', 'deleteUser'> = async (_, args, ctx) => {
  // Verifica se é o próprio usuário
  requireOwnership(ctx, args.id)

  return ctx.prisma.user.delete({
    where: { id: args.id },
  })
}
