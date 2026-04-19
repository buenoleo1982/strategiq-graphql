import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'TITLE' | 'SEVERITY' | 'STATUS' | 'OCCURRED_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.NonConformityOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'TITLE':
      return { title: sortDirection }
    case 'SEVERITY':
      return { severity: sortDirection }
    case 'STATUS':
      return { status: sortDirection }
    case 'OCCURRED_AT':
      return { occurredAt: sortDirection }
    case 'CREATED_AT':
      return { createdAt: sortDirection }
    case 'ID':
    default:
      return { id: sortDirection }
  }
}

export const nonConformityLoad: FieldResolver<'Query', 'nonConformityLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.NonConformityWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.title
      ? {
          title: {
            contains: args.filterArgs.title,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(args.filterArgs?.severity ? { severity: args.filterArgs.severity } : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
    ...(args.filterArgs?.department
      ? {
          department: {
            contains: args.filterArgs.department,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(args.filterArgs?.ownerId ? { ownerId: args.filterArgs.ownerId } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.nonConformity, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.nonConformity.findMany({
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
