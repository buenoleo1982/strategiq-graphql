import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { buildEvidenceWhere } from '@/service/evidences'

export const evidenceLoad: FieldResolver<'Query', 'evidenceLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where = buildEvidenceWhere(args.filterArgs ?? undefined)
  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.evidence, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.evidence.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    nodes,
    pagination,
  }
}
