import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateNonConformity: FieldResolver<'Mutation', 'updateNonConformity'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.nonConformity.update({
    where: { id: args.id },
    data: {
      title: args.title ?? undefined,
      description: args.description ?? undefined,
      severity: args.severity ?? undefined,
      status: args.status ?? undefined,
      source: args.source ?? undefined,
      department: args.department ?? undefined,
      occurredAt: args.occurredAt ?? undefined,
      ownerId: args.ownerId ?? undefined,
      updatedById: ctx.currentUser.id,
    },
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })
}
