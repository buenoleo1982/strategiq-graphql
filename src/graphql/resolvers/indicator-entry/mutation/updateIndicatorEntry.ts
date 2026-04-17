import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateIndicatorEntry: FieldResolver<'Mutation', 'updateIndicatorEntry'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.indicatorEntry.update({
      where: { id: args.id },
      data: {
        ...(args.indicatorId !== null && args.indicatorId !== undefined
          ? {
              indicator: {
                connect: {
                  id: args.indicatorId,
                },
              },
            }
          : {}),
        ...(args.value !== null && args.value !== undefined ? { value: args.value } : {}),
        ...(args.collectedAt !== null && args.collectedAt !== undefined
          ? { collectedAt: args.collectedAt }
          : {}),
        ...(args.source !== null && args.source !== undefined ? { source: args.source } : {}),
        ...(args.notes !== null && args.notes !== undefined ? { notes: args.notes } : {}),
      },
    })
  } catch {
    return null
  }
}
