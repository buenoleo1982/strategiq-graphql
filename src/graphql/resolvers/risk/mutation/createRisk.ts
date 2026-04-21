import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createRisk: FieldResolver<'Mutation', 'createRisk'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.risk.create({
    data: {
      nonConformityId: args.nonConformityId,
      title: args.title,
      description: args.description,
      category: args.category,
      probability: args.probability,
      impact: args.impact,
      status: args.status ?? 'OPEN',
      dueAt: args.dueAt,
      ownerId: args.ownerId,
      createdById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
