import { extendType } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { resolveOperationalAlerts } from '@/service/alerts'

export const OperationalAlertQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.nonNull.field('operationalAlerts', {
      type: 'OperationalAlert',
      resolve: async (_root, _args, ctx) => {
        requireAuth(ctx)
        return resolveOperationalAlerts(ctx.prisma)
      },
    })
  },
})
