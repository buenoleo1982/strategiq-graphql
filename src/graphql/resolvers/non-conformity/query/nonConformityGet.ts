import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const nonConformityGet: FieldResolver<'Query', 'nonConformityGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.nonConformity.findUnique({
    where: { id: args.id },
  })
}
