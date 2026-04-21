import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const initiativeGet: FieldResolver<'Query', 'initiativeGet'> = async (_, args, ctx) => {
  requireAuth(ctx)

  if (!args.id) {
    return null
  }

  return ctx.prisma.initiative.findUnique({
    where: { id: args.id },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
