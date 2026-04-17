import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const indicatorGet: FieldResolver<'Query', 'indicatorGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.indicator.findUnique({
    where: { id: args.id },
  })
}
