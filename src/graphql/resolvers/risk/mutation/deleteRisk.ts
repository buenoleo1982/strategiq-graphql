import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteRisk: FieldResolver<'Mutation', 'deleteRisk'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.risk.delete({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
