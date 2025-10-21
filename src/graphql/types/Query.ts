import { queryType } from 'nexus';

export const Query = queryType({
  definition(t) {
    t.list.field('users', {
      type: 'User',
      resolve: async (_parent, _args, ctx) => {
        return ctx.prisma.user.findMany();
      },
    });

    t.field('user', {
      type: 'User',
      args: {
        id: 'Int',
      },
      resolve: async (_parent, args, ctx) => {
        if (!args.id) return null;
        return ctx.prisma.user.findUnique({
          where: { id: args.id },
        });
      },
    });
  },
});
