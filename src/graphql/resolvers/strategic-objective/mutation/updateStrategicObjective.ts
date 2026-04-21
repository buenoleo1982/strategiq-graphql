import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateStrategicObjective: FieldResolver<'Mutation', 'updateStrategicObjective'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.strategicObjective.update({
      where: { id: args.id },
      data: {
        ...(args.title !== null && args.title !== undefined ? { title: args.title } : {}),
        ...(args.description !== null && args.description !== undefined
          ? { description: args.description }
          : {}),
        ...(args.status ? { status: args.status } : {}),
        ...(args.priority ? { priority: args.priority } : {}),
        ...(args.startsAt !== undefined ? { startsAt: args.startsAt } : {}),
        ...(args.endsAt !== undefined ? { endsAt: args.endsAt } : {}),
        ...(args.ownerId !== undefined ? { ownerId: args.ownerId } : {}),
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
