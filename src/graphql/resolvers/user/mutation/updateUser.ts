import type { FieldResolver } from 'nexus'

export const updateUser: FieldResolver<'Mutation', 'updateUser'> = async (_, args, ctx) => {
  try {
    const result = await ctx.prisma.user.update({
      where: { id: args.id },
      data: {
        ...(args.name && { name: args.name }),
        ...(args.email && { email: args.email }),
      },
    })

    return result
  } catch {
    // Se o usuário não existir, retorna null
    return null
  }
}
