import type { FieldResolver } from 'nexus'

export const deleteUser: FieldResolver<'Mutation', 'deleteUser'> = async (_, args, ctx) => {
  try {
    return await ctx.prisma.user.delete({
      where: { id: args.id },
    })
  } catch {
    // Se o usuário não existir, retorna null
    return null
  }
}
