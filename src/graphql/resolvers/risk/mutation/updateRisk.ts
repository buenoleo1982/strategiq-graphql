import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateRisk: FieldResolver<'Mutation', 'updateRisk'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.risk.update({
    where: { id: args.id },
    data: {
      nonConformityId: args.nonConformityId ?? undefined,
      title: args.title ?? undefined,
      description: args.description ?? undefined,
      category: args.category ?? undefined,
      probability: args.probability ?? undefined,
      impact: args.impact ?? undefined,
      status: args.status ?? undefined,
      dueAt: args.dueAt ?? undefined,
      ownerId: args.ownerId ?? undefined,
      updatedById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
