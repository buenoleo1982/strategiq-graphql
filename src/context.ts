import type { PrismaClient } from '@prisma/client'
import type { YogaInitialContext } from 'graphql-yoga'
import type { Logger } from 'pino'
import { prisma } from './db'
import { createContextLogger } from './lib/logger'
import { extractOrGenerateTraceId } from './lib/logger/trace'

export interface Context {
  prisma: PrismaClient
  logger: Logger
  traceId: string
}

export function createContext(initialContext: YogaInitialContext): Context {
  // Extrai ou gera trace ID da requisição
  const traceId = extractOrGenerateTraceId(initialContext.request.headers)

  // Cria logger com contexto da requisição
  const logger = createContextLogger({ traceId })

  return {
    prisma,
    logger,
    traceId,
  }
}
