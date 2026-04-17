import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createIndicatorEntry: FieldResolver<'Mutation', 'createIndicatorEntry'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.indicatorEntry.create({
    data: {
      indicatorId: args.indicatorId,
      value: args.value,
      collectedAt: args.collectedAt ?? undefined,
      source: args.source,
      notes: args.notes,
    },
  })
}
