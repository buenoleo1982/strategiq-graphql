import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'NAME' | 'FREQUENCY' | 'TARGET_VALUE' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.IndicatorOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'NAME':
      return { name: sortDirection }
    case 'FREQUENCY':
      return { frequency: sortDirection }
    case 'TARGET_VALUE':
      return { targetValue: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const indicatorLoad: FieldResolver<'Query', 'indicatorLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.IndicatorWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.name
      ? {
          name: {
            contains: args.filterArgs.name,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(args.filterArgs?.frequency ? { frequency: args.filterArgs.frequency } : {}),
    ...(args.filterArgs?.ownerId ? { ownerId: args.filterArgs.ownerId } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.indicator, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.indicator.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
    include: {
      entries: {
        orderBy: {
          collectedAt: 'desc',
        },
        take: 1,
      },
    },
  })

  return {
    nodes,
    pagination,
  }
}
