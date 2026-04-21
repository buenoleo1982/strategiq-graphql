import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const preventiveActionGet: FieldResolver<'Query', 'preventiveActionGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.preventiveAction.findUnique({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
