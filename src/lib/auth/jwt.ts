import { jwtVerify, SignJWT } from 'jose'
import type { TokenPayload } from '@/types/auth'

/**
 * Serviço de geração e validação de tokens JWT
 */
export class JWTService {
  private static getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET não configurado')
    }
    return new TextEncoder().encode(secret)
  }

  /**
   * Gera um access token (15 minutos de validade)
   */
  static async generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    const secret = this.getSecret()

    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret)
  }

  /**
   * Gera um refresh token (7 dias de validade)
   */
  static async generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    const secret = this.getSecret()

    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const secret = this.getSecret()
      const { payload } = await jwtVerify(token, secret)

      if (!payload.userId || !payload.email) {
        throw new Error('Token inválido: payload incompleto')
      }

      return {
        userId: payload.userId as number,
        email: payload.email as string,
        iat: payload.iat,
        exp: payload.exp,
      }
    } catch (_error) {
      throw new Error('Token inválido ou expirado')
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    return authHeader.substring(7)
  }
}
