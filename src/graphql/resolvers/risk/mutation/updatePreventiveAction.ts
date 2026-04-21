import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updatePreventiveAction: FieldResolver<'Mutation', 'updatePreventiveAction'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.preventiveAction.update({
    where: { id: args.id },
    data: {
      riskId: args.riskId ?? undefined,
      title: args.title ?? undefined,
      description: args.description ?? undefined,
      status: args.status ?? undefined,
      dueAt: args.dueAt ?? undefined,
      completedAt: args.completedAt ?? undefined,
      ownerId: args.ownerId ?? undefined,
      updatedById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
