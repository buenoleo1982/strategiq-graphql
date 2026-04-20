import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { evidenceAuditInclude } from '@/service/evidences'

export const updateEvidence: FieldResolver<'Mutation', 'updateEvidence'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const evidence = await ctx.prisma.evidence.findFirst({
    where: {
      id: args.id,
      deletedAt: null,
    },
  })

  if (!evidence) {
    return null
  }

  return ctx.prisma.evidence.update({
    where: { id: args.id },
    data: {
      label: args.label?.trim() || null,
      updatedById: ctx.currentUser!.id,
    },
    include: evidenceAuditInclude,
  })
}
