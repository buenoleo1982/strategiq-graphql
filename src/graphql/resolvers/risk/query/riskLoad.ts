import { requireAuth } from '@/lib/auth/guards'
import { calculateRiskLevel } from '@/service/risks'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'NON_CONFORMITY_ID' | 'TITLE' | 'STATUS' | 'DUE_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.RiskOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'NON_CONFORMITY_ID':
      return { nonConformityId: sortDirection }
    case 'TITLE':
      return { title: sortDirection }
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

export const riskLoad: FieldResolver<'Query', 'riskLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.RiskWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.nonConformityId ? { nonConformityId: args.filterArgs.nonConformityId } : {}),
    ...(args.filterArgs?.title
      ? { title: { contains: args.filterArgs.title, mode: 'insensitive' } }
      : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.risk, args.pageArgs, { where })

  let nodes = await ctx.prisma.risk.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })

  if (args.filterArgs?.level) {
    nodes = nodes.filter(risk => calculateRiskLevel(risk.probability, risk.impact) === args.filterArgs?.level)
  }

  return { nodes, pagination }
}
