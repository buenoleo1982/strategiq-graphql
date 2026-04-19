import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteEffectivenessCheck: FieldResolver<'Mutation', 'deleteEffectivenessCheck'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.effectivenessCheck.delete({
    where: { id: args.id },
  })
}
