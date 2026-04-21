import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const strategicObjectiveGet: FieldResolver<'Query', 'strategicObjectiveGet'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.strategicObjective.findUnique({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
