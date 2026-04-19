import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createCorrectiveAction: FieldResolver<'Mutation', 'createCorrectiveAction'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.correctiveAction.create({
    data: {
      nonConformityId: args.nonConformityId,
      title: args.title,
      description: args.description,
      status: args.status ?? 'OPEN',
      dueAt: args.dueAt,
      completedAt: args.completedAt,
      ownerId: args.ownerId,
    },
  })
}
