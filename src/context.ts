import { prisma } from './db'
import { AuthService } from './lib/auth/auth.service'
import { JWTService } from './lib/auth/jwt'
import { createContextLogger } from './lib/logger'
import { generateTraceId } from './lib/logger/trace'
import { PaginationService } from './service/paginations'
import type { AuthenticatedUser } from './types/auth'

import type { Context, CreateContextParams } from './types.d.ts'

export async function createContext({ req, res }: CreateContextParams): Promise<Context> {
  // Extrai ou gera trace ID da requisição
  const traceId =
    (req.headers['x-trace-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    generateTraceId()

  // Cria logger com contexto da requisição
  const logger = createContextLogger({ traceId })

  // Extrai e valida token de autenticação
  let currentUser: AuthenticatedUser | null = null

  try {
    const authHeader = req.headers.authorization || null
    const token = JWTService.extractTokenFromHeader(authHeader)

    if (token) {
      currentUser = await AuthService.validateAccessToken(token)
    }
  } catch (error) {
    logger.debug({ error }, 'Falha ao validar token de autenticação')
  }

  const services = {
    pagination: new PaginationService(),
  }

  return {
    prisma,
    logger,
    traceId,
    currentUser,
    req,
    res,
    services,
  }
}
