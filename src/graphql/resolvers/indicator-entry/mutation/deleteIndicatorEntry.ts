import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

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
