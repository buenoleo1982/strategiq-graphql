export interface TokenPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RefreshTokenInput {
  refreshToken: string
}

export interface AuthenticatedUser {
  id: number
  email: string
  name: string
}
