import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'INDICATOR_ID' | 'VALUE' | 'COLLECTED_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.IndicatorEntryOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'INDICATOR_ID':
      return { indicatorId: sortDirection }
    case 'VALUE':
      return { value: sortDirection }
    case 'COLLECTED_AT':
      return { collectedAt: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const indicatorEntryLoad: FieldResolver<'Query', 'indicatorEntryLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.IndicatorEntryWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.indicatorId ? { indicatorId: args.filterArgs.indicatorId } : {}),
    ...(args.filterArgs?.source
      ? {
          source: {
            contains: args.filterArgs.source,
            mode: 'insensitive',
          },
        }
      : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.indicatorEntry, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.indicatorEntry.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
  })

  return {
    nodes,
    pagination,
  }
}
