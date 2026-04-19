import { requireAuth } from '@/lib/auth/guards'
import type { Prisma } from '@prisma/client'
import type { FieldResolver } from 'nexus'

const getOrderBy = (
  column?: 'ID' | 'NON_CONFORMITY_ID' | 'STATUS' | 'DUE_AT' | 'CREATED_AT',
  direction?: 'ASC' | 'DESC'
): Prisma.CorrectiveActionOrderByWithRelationInput => {
  const sortDirection = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  switch (column) {
    case 'NON_CONFORMITY_ID':
      return { nonConformityId: sortDirection }
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

export const correctiveActionLoad: FieldResolver<'Query', 'correctiveActionLoad'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const where: Prisma.CorrectiveActionWhereInput = {
    ...(args.filterArgs?.id ? { id: args.filterArgs.id } : {}),
    ...(args.filterArgs?.nonConformityId ? { nonConformityId: args.filterArgs.nonConformityId } : {}),
    ...(args.filterArgs?.status ? { status: args.filterArgs.status } : {}),
    ...(args.filterArgs?.ownerId ? { ownerId: args.filterArgs.ownerId } : {}),
  }

  const pagination = await ctx.services.pagination.getPagination(ctx.prisma.correctiveAction, args.pageArgs, {
    where,
  })

  const nodes = await ctx.prisma.correctiveAction.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: getOrderBy(args.order?.column, args.order?.direction),
  })

  return { nodes, pagination }
}
