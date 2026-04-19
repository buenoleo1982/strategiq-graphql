import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const effectivenessCheckGet: FieldResolver<'Query', 'effectivenessCheckGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.effectivenessCheck.findUnique({
    where: { id: args.id },
  })
}
