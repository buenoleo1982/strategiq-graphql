import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'TITLE' | 'STATUS' | 'PRIORITY' | 'STARTS_AT' | 'ENDS_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.StrategicObjectiveOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'TITLE':
      return { title: sortDirection }
    case 'STATUS':
      return { status: sortDirection }
    case 'PRIORITY':
      return { priority: sortDirection }
    case 'STARTS_AT':
      return { startsAt: sortDirection }
    case 'ENDS_AT':
      return { endsAt: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const strategicObjectiveLoad: FieldResolver<'Query', 'strategicObjectiveLoad'> = async (
  _,
  args,
  ctx
) => {
  requireAuth(ctx)

  const where: Prisma.StrategicObjectiveWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.title
      ? {
          title: {
            contains: args.filterArgs.title,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
    ...(args.filterArgs?.priority ? { priority: args.filterArgs.priority } : {}),
    ...(args.filterArgs?.ownerId ? { ownerId: args.filterArgs.ownerId } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.strategicObjective, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.strategicObjective.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
    include: {
      createdBy: true,
      updatedBy: true,
    },
  })

  return {
    nodes,
    pagination,
  }
}
