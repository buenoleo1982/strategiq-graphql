import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createPreventiveAction: FieldResolver<'Mutation', 'createPreventiveAction'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.preventiveAction.create({
    data: {
      riskId: args.riskId,
      title: args.title,
      description: args.description,
      status: args.status ?? 'OPEN',
      dueAt: args.dueAt,
      completedAt: args.completedAt,
      ownerId: args.ownerId,
      createdById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
