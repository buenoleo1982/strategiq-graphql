import type { FieldResolver } from 'nexus'

export const userLoad: FieldResolver<'Query', 'userLoad'> = async (_, args, { prisma, services }) => {
  // Get pagination info first
  const pagination = await services.pagination.getPagination(
    prisma.user,
    args.pageArgs
  )

  // Use pagination info to fetch nodes
  const nodes = await prisma.user.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: {
      id: 'asc'
    }
  })

  return {
    nodes: nodes,
    pagination: pagination
  }
}
