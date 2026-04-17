import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createIndicator: FieldResolver<'Mutation', 'createIndicator'> = async (_, args, ctx) => {
  requireAuth(ctx)

  return ctx.prisma.indicator.create({
    data: {
      name: args.name,
      description: args.description,
      formula: args.formula,
      unit: args.unit,
      targetValue: args.targetValue,
      frequency: args.frequency ?? 'MONTHLY',
      ownerId: args.ownerId,
    },
  })
}
