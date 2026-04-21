import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deletePreventiveAction: FieldResolver<'Mutation', 'deletePreventiveAction'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.preventiveAction.delete({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
