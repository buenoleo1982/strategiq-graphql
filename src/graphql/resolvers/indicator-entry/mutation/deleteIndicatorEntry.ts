import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'

export const deleteIndicatorEntry: FieldResolver<'Mutation', 'deleteIndicatorEntry'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.indicatorEntry.delete({
      where: { id: args.id },
    })
  } catch {
    return null
  }
}
