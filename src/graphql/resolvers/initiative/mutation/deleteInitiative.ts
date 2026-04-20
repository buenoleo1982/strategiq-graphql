import { requireAuth } from '@/lib/auth/guards'
import type { FieldResolver } from 'nexus'

export const deleteInitiative: FieldResolver<'Mutation', 'deleteInitiative'> = async (_, args, ctx) => {
  requireAuth(ctx)

  try {
    return await ctx.prisma.initiative.delete({
      where: { id: args.id },
    })
  } catch {
    return null
  }
}
