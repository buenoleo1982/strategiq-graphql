import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { evidenceAuditInclude } from '@/service/evidences'

export const restoreEvidence: FieldResolver<'Mutation', 'restoreEvidence'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const evidence = await ctx.prisma.evidence.findFirst({
    where: {
      id: args.id,
      deletedAt: { not: null },
    },
  })

  if (!evidence) {
    return null
  }

  return ctx.prisma.evidence.update({
    where: { id: args.id },
    data: {
      deletedAt: null,
      deletedById: null,
      updatedById: ctx.currentUser!.id,
    },
    include: evidenceAuditInclude,
  })
}
