import { extendType, nonNull, stringArg } from 'nexus'

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createUser', {
      type: 'User',
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
          },
        })
      },
    })

    t.field('updateUser', {
      type: 'User',
      args: {
        id: nonNull('Int'),
        name: stringArg(),
        email: stringArg(),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.prisma.user.update({
          where: { id: args.id },
          data: {
            ...(args.name && { name: args.name }),
            ...(args.email && { email: args.email }),
          },
        })
      },
    })

    t.field('deleteUser', {
      type: 'User',
      args: {
        id: nonNull('Int'),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.prisma.user.delete({
          where: { id: args.id },
        })
      },
    })
  },
})
