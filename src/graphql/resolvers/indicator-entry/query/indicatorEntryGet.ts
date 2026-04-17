import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const indicatorEntryGet: FieldResolver<'Query', 'indicatorEntryGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.indicatorEntry.findUnique({
    where: { id: args.id },
  })
}
