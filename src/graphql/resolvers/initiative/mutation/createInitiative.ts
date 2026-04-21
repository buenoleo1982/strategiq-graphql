import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createInitiative: FieldResolver<'Mutation', 'createInitiative'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.initiative.create({
    data: {
      strategicObjectiveId: args.strategicObjectiveId,
      title: args.title,
      description: args.description,
      status: args.status ?? 'PLANNED',
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
