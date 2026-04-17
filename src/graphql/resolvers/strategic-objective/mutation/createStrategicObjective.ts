import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const createStrategicObjective: FieldResolver<'Mutation', 'createStrategicObjective'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  return ctx.prisma.strategicObjective.create({
    data: {
      title: args.title,
      description: args.description,
      status: args.status ?? 'DRAFT',
      priority: args.priority ?? 'MEDIUM',
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      ownerId: args.ownerId,
    },
  })
}
