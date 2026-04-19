import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'CORRECTIVE_ACTION_ID' | 'CHECKED_AT' | 'RESULT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.EffectivenessCheckOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'CORRECTIVE_ACTION_ID':
      return { correctiveActionId: sortDirection }
    case 'CHECKED_AT':
      return { checkedAt: sortDirection }
    case 'RESULT':
      return { result: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const effectivenessCheckLoad: FieldResolver<'Query', 'effectivenessCheckLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.EffectivenessCheckWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.correctiveActionId ? { correctiveActionId: args.filterArgs.correctiveActionId } : {}),
    ...(args.filterArgs?.result ? { result: args.filterArgs.result } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.effectivenessCheck, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.effectivenessCheck.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
  })

  return { nodes, pagination }
}
