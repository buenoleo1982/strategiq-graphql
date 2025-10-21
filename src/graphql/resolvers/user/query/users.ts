import type { FieldResolver } from 'nexus'

export const users: FieldResolver<'Query', 'users'> = async (_, _args, ctx) => {
  return ctx.prisma.user.findMany()
}
