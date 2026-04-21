import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateIndicator: FieldResolver<'Mutation', 'updateIndicator'> = async (_, args, ctx) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.indicator.update({
      where: { id: args.id },
      data: {
        ...(args.name !== null && args.name !== undefined ? { name: args.name } : {}),
        ...(args.description !== null && args.description !== undefined
          ? { description: args.description }
          : {}),
        ...(args.formula !== null && args.formula !== undefined ? { formula: args.formula } : {}),
        ...(args.unit !== null && args.unit !== undefined ? { unit: args.unit } : {}),
        ...(args.targetValue !== undefined ? { targetValue: args.targetValue } : {}),
        ...(args.frequency ? { frequency: args.frequency } : {}),
        ...(args.ownerId !== undefined ? { ownerId: args.ownerId } : {}),
        updatedById: ctx.currentUser.id,
      },
      include: {
        createdBy: true,
        updatedBy: true,
        entries: {
          orderBy: { collectedAt: 'desc' },
          take: 1,
        },
      },
    })
  } catch {
    return null
  }
}
