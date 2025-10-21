import Redis from 'ioredis'

/**
 * Singleton para gerenciar a conexão com Redis
 */
class RedisClient {
  private static instance: Redis | null = null

  private constructor() {}

  static getInstance(): Redis {
    if (!this.instance) {
      const url = process.env.REDIS_URL || 'redis://localhost:6379'
      this.instance = new Redis(url)
    }
    return this.instance
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit()
      this.instance = null
    }
  }
}

/**
 * Serviço de cache para tokens de autenticação
 */
export class TokenCache {
  private static readonly PREFIX = 'auth:token:'
  private static readonly REFRESH_PREFIX = 'auth:refresh:'
  private static readonly BLACKLIST_PREFIX = 'auth:blacklist:'

  /**
   * Armazena um refresh token no cache
   * @param userId ID do usuário
   * @param token Token a ser armazenado
   * @param ttlSeconds Tempo de vida em segundos (padrão: 7 dias)
   */
  static async storeRefreshToken(
    userId: number,
    token: string,
    ttlSeconds = 7 * 24 * 60 * 60
  ): Promise<void> {
    const redis = RedisClient.getInstance()
    const key = `${this.REFRESH_PREFIX}${userId}`
    await redis.setex(key, ttlSeconds, token)
  }

  /**
   * Recupera o refresh token de um usuário
   */
  static async getRefreshToken(userId: number): Promise<string | null> {
    const redis = RedisClient.getInstance()
    const key = `${this.REFRESH_PREFIX}${userId}`
    const token = await redis.get(key)
    return token
  }

  /**
   * Remove o refresh token de um usuário (logout)
   */
  static async removeRefreshToken(userId: number): Promise<void> {
    const redis = RedisClient.getInstance()
    const key = `${this.REFRESH_PREFIX}${userId}`
    await redis.del(key)
  }

  /**
   * Adiciona um token à blacklist (usado quando o token foi invalidado antes de expirar)
   */
  static async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    const redis = RedisClient.getInstance()
    const key = `${this.BLACKLIST_PREFIX}${token}`
    await redis.setex(key, ttlSeconds, '1')
  }

  /**
   * Verifica se um token está na blacklist
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const redis = RedisClient.getInstance()
    const key = `${this.BLACKLIST_PREFIX}${token}`
    const result = await redis.get(key)
    return result !== null
  }

  /**
   * Armazena dados de sessão customizados
   */
  static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redis = RedisClient.getInstance()
    const fullKey = `${this.PREFIX}${key}`

    if (ttlSeconds) {
      await redis.setex(fullKey, ttlSeconds, value)
    } else {
      await redis.set(fullKey, value)
    }
  }

  /**
   * Recupera dados de sessão
   */
  static async get(key: string): Promise<string | null> {
    const redis = RedisClient.getInstance()
    const fullKey = `${this.PREFIX}${key}`
    return await redis.get(fullKey)
  }

  /**
   * Remove dados de sessão
   */
  static async delete(key: string): Promise<void> {
    const redis = RedisClient.getInstance()
    const fullKey = `${this.PREFIX}${key}`
    await redis.del(fullKey)
  }
}

export { RedisClient }
