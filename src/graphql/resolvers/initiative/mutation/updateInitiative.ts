import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateInitiative: FieldResolver<'Mutation', 'updateInitiative'> = async (_, args, ctx) => {
  requireAuth(ctx)

  try {
    const data = {
      ...(typeof args.strategicObjectiveId === 'number'
        ? { strategicObjectiveId: args.strategicObjectiveId }
        : {}),
      ...(args.title !== null && args.title !== undefined ? { title: args.title } : {}),
      ...(args.description !== null && args.description !== undefined
        ? { description: args.description }
        : {}),
      ...(args.status ? { status: args.status } : {}),
      ...(args.dueAt !== undefined ? { dueAt: args.dueAt } : {}),
      ...(args.ownerId !== undefined ? { ownerId: args.ownerId } : {}),
    }

    return await ctx.prisma.initiative.update({
      where: { id: args.id },
      data: {
        ...data,
        updatedById: ctx.currentUser.id,
      },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    })
  } catch {
    return null
  }
}
