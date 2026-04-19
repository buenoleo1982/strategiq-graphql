import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const updateEffectivenessCheck: FieldResolver<'Mutation', 'updateEffectivenessCheck'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.effectivenessCheck.update({
    where: { id: args.id },
    data: {
      correctiveActionId: args.correctiveActionId ?? undefined,
      checkedAt: args.checkedAt ?? undefined,
      result: args.result ?? undefined,
      notes: args.notes ?? undefined,
    },
  })
}
