import { objectType } from 'nexus'

export const AuthTokens = objectType({
  name: 'AuthTokens',
  definition(t) {
    t.nonNull.string('accessToken')
    t.nonNull.string('refreshToken')
  },
})

export const AuthResponse = objectType({
  name: 'AuthResponse',
  definition(t) {
    t.nonNull.field('tokens', { type: AuthTokens })
    t.nonNull.field('user', { type: 'User' })
  },
})
