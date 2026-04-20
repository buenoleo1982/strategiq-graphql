import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'STRATEGIC_OBJECTIVE_ID' | 'TITLE' | 'STATUS' | 'DUE_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.InitiativeOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'STRATEGIC_OBJECTIVE_ID':
      return { strategicObjectiveId: sortDirection }
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

export const initiativeLoad: FieldResolver<'Query', 'initiativeLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.InitiativeWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.strategicObjectiveId ? { strategicObjectiveId: args.filterArgs.strategicObjectiveId } : {}),
    ...(args.filterArgs?.title
      ? {
          title: {
            contains: args.filterArgs.title,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
    ...(args.filterArgs?.ownerId ? { ownerId: args.filterArgs.ownerId } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.initiative, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.initiative.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
  })

  return { nodes, pagination }
}
