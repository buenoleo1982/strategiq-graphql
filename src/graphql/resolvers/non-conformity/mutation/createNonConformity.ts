import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createNonConformity: FieldResolver<'Mutation', 'createNonConformity'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.nonConformity.create({
    data: {
      title: args.title,
      description: args.description,
      severity: args.severity ?? 'MEDIUM',
      status: args.status ?? 'OPEN',
      source: args.source,
      department: args.department,
      occurredAt: args.occurredAt,
      ownerId: args.ownerId,
      createdById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
