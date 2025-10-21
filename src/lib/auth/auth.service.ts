import { GraphQLError } from 'graphql'
import { prisma } from '@/db'
import type { AuthenticatedUser, AuthTokens, LoginInput } from '@/types/auth'
import { TokenCache } from '../cache/redis'
import { JWTService } from './jwt'
import { PasswordService } from './password'

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Realiza login do usuário
   */
  static async login(input: LoginInput): Promise<AuthTokens> {
    const { email, password } = input

    // Busca usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new GraphQLError('Credenciais inválidas', {
        extensions: { code: 'UNAUTHORIZED' },
      })
    }

    // Verifica senha
    const isPasswordValid = await PasswordService.verify(password, user.password)

    if (!isPasswordValid) {
      throw new GraphQLError('Credenciais inválidas', {
        extensions: { code: 'UNAUTHORIZED' },
      })
    }

    // Gera tokens
    const payload = { userId: user.id, email: user.email }
    const [accessToken, refreshToken] = await Promise.all([
      JWTService.generateAccessToken(payload),
      JWTService.generateRefreshToken(payload),
    ])

    // Armazena refresh token no Redis
    await TokenCache.storeRefreshToken(user.id, refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(userId: number, accessToken: string): Promise<void> {
    // Remove refresh token do Redis
    await TokenCache.removeRefreshToken(userId)

    // Adiciona access token à blacklist (expira em 15 minutos)
    await TokenCache.blacklistToken(accessToken, 15 * 60)
  }

  /**
   * Renova o access token usando o refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verifica se o refresh token é válido
    const payload = await JWTService.verifyToken(refreshToken)

    // Verifica se o refresh token está armazenado no Redis
    const storedToken = await TokenCache.getRefreshToken(payload.userId)

    if (!storedToken || storedToken !== refreshToken) {
      throw new GraphQLError('Refresh token inválido', {
        extensions: { code: 'UNAUTHORIZED' },
      })
    }

    // Verifica se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new GraphQLError('Usuário não encontrado', {
        extensions: { code: 'UNAUTHORIZED' },
      })
    }

    // Gera novos tokens
    const newPayload = { userId: user.id, email: user.email }
    const [accessToken, newRefreshToken] = await Promise.all([
      JWTService.generateAccessToken(newPayload),
      JWTService.generateRefreshToken(newPayload),
    ])

    // Atualiza refresh token no Redis
    await TokenCache.storeRefreshToken(user.id, newRefreshToken)

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  /**
   * Valida um access token e retorna o usuário autenticado
   */
  static async validateAccessToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      // Verifica se o token está na blacklist
      const isBlacklisted = await TokenCache.isTokenBlacklisted(token)
      if (isBlacklisted) {
        return null
      }

      // Valida o token
      const payload = await JWTService.verifyToken(token)

      // Busca usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return null
      }

      return user
    } catch (_error) {
      return null
    }
  }

  /**
   * Registra um novo usuário
   */
  static async register(name: string, email: string, password: string): Promise<AuthenticatedUser> {
    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new GraphQLError('Email já está em uso', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    // Hash da senha
    const hashedPassword = await PasswordService.hash(password)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return user
  }
}
