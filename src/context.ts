import type { PrismaClient } from '@prisma/client'
import type { YogaInitialContext } from 'graphql-yoga'
import type { Logger } from 'pino'
import { prisma } from './db'
import { AuthService } from './lib/auth/auth.service'
import { JWTService } from './lib/auth/jwt'
import { createContextLogger } from './lib/logger'
import { extractOrGenerateTraceId } from './lib/logger/trace'
import type { AuthenticatedUser } from './types/auth'

export interface Context {
  prisma: PrismaClient
  logger: Logger
  traceId: string
  currentUser: AuthenticatedUser | null
  request: Request
}

export async function createContext(initialContext: YogaInitialContext): Promise<Context> {
  // Extrai ou gera trace ID da requisição
  const traceId = extractOrGenerateTraceId(initialContext.request.headers)

  // Cria logger com contexto da requisição
  const logger = createContextLogger({ traceId })

  // Extrai e valida token de autenticação
  let currentUser: AuthenticatedUser | null = null

  try {
    const authHeader = initialContext.request.headers.get('authorization')
    const token = JWTService.extractTokenFromHeader(authHeader)

    if (token) {
      currentUser = await AuthService.validateAccessToken(token)
    }
  } catch (error) {
    logger.debug({ error }, 'Falha ao validar token de autenticação')
  }

  return {
    prisma,
    logger,
    traceId,
    currentUser,
    request: initialContext.request,
  }
}
