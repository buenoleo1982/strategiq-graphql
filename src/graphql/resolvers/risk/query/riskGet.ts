import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const riskGet: FieldResolver<'Query', 'riskGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.risk.findUnique({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
