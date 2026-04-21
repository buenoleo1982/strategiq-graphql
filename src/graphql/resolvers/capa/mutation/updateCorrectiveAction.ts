import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateCorrectiveAction: FieldResolver<'Mutation', 'updateCorrectiveAction'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.correctiveAction.update({
    where: { id: args.id },
    data: {
      nonConformityId: args.nonConformityId ?? undefined,
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
