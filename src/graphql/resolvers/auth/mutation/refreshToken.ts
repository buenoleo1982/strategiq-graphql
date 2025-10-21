import type { FieldResolver } from 'nexus'
import { AuthService } from '@/lib/auth/auth.service'

export const refreshToken: FieldResolver<'Mutation', 'refreshToken'> = async (
  _,
  { refreshToken },
  ctx
) => {
  ctx.logger.info('Renovando access token')

  const tokens = await AuthService.refreshToken(refreshToken)

  return tokens
}
