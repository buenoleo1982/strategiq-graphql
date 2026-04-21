import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'RISK_ID' | 'STATUS' | 'DUE_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.PreventiveActionOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'RISK_ID':
      return { riskId: sortDirection }
    case 'STATUS':
      return { status: sortDirection }
    case 'DUE_AT':
      return { dueAt: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const preventiveActionLoad: FieldResolver<'Query', 'preventiveActionLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.PreventiveActionWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.riskId ? { riskId: args.filterArgs.riskId } : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.preventiveAction, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.preventiveAction.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })

  return { nodes, pagination }
}
