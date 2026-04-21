import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const correctiveActionGet: FieldResolver<'Query', 'correctiveActionGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.correctiveAction.findUnique({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
