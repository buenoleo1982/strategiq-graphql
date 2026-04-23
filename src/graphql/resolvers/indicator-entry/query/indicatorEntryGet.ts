import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'

export const indicatorEntryGet: FieldResolver<'Query', 'indicatorEntryGet'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.indicatorEntry.findUnique({
    where: { id: args.id },
  })
}
