import type { FieldResolver } from 'nexus'

export const userGet: FieldResolver<'Query', 'userGet'> = async (_, args, ctx) => {
  if (!args.id) return null

  return ctx.prisma.user.findUnique({
    where: { id: args.id },
  })
}
