import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteIndicator: FieldResolver<'Mutation', 'deleteIndicator'> = async (_, args, ctx) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.indicator.delete({
      where: { id: args.id },
    })
  } catch {
    return null
  }
}
