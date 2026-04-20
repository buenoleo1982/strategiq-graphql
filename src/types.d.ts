import { PrismaClient } from '@prisma/client'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Logger } from 'pino'

import type { PaginationService } from './service/paginations'
import type { AuthenticatedUser } from './types/auth'

export interface Services {
  pagination: PaginationService
}

export interface Context {
  prisma: PrismaClient
  logger: Logger
  traceId: string
  currentUser: AuthenticatedUser | null
  req: FastifyRequest
  res: FastifyReply
  services: Services
}

export interface CreateContextParams {
  req: FastifyRequest
  res: FastifyReply
}
