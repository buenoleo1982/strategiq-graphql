import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createEffectivenessCheck: FieldResolver<'Mutation', 'createEffectivenessCheck'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.effectivenessCheck.create({
    data: {
      correctiveActionId: args.correctiveActionId,
      checkedAt: args.checkedAt,
      result: args.result,
      notes: args.notes,
    },
  })
}
