import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteStrategicObjective: FieldResolver<'Mutation', 'deleteStrategicObjective'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.strategicObjective.delete({
      where: { id: args.id },
    })
  } catch {
    return null
  }
}
