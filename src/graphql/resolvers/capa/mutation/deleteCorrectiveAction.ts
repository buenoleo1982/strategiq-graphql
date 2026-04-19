import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteCorrectiveAction: FieldResolver<'Mutation', 'deleteCorrectiveAction'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.correctiveAction.delete({
    where: { id: args.id },
  })
}
