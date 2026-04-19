import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteNonConformity: FieldResolver<'Mutation', 'deleteNonConformity'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.nonConformity.delete({
    where: { id: args.id },
  })
}
