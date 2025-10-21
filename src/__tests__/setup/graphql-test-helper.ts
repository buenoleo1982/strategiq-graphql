import type { PrismaClient } from '@prisma/client'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { Context } from '../../context'
import { schema } from '../../graphql/schema'
import { createContextLogger } from '../../lib/logger'
import { generateTraceId } from '../../lib/logger/trace'
import type { AuthenticatedUser } from '../../types/auth'

// Cache the Yoga instance to avoid recreating it for each test
let cachedYoga: YogaServerInstance<Record<string, any>, Context> | null = null
let cachedPrisma: PrismaClient | null = null

export interface CreateTestServerOptions {
  prisma: PrismaClient
  currentUser?: AuthenticatedUser | null
}

export const createTestServer = (prismaOrOptions: PrismaClient | CreateTestServerOptions) => {
  // Check if it's options object (has prisma property) or direct PrismaClient
  const options: CreateTestServerOptions =
    'prisma' in prismaOrOptions ? prismaOrOptions : { prisma: prismaOrOptions, currentUser: null }

  const { prisma, currentUser = null } = options

  // Reuse cached instance if Prisma client is the same and no auth needed
  if (cachedYoga && cachedPrisma === prisma && !currentUser) {
    return cachedYoga
  }

  // Create new instance
  const yoga = createYoga<Record<string, any>, Context>({
    schema,
    context: () => {
      const traceId = generateTraceId()
      return {
        prisma,
        logger: createContextLogger({ traceId }),
        traceId,
        currentUser,
        request: new Request('http://localhost/graphql'),
      }
    },
    logging: false, // Disable logging in tests
    maskedErrors: false, // Show real errors in tests (useful for debugging)
  })

  // Only cache if no authentication
  if (!currentUser) {
    cachedYoga = yoga
    cachedPrisma = prisma
  }

  return yoga
}

/**
 * Reset the cached Yoga instance (useful for tests that need a fresh instance)
 */
export const resetTestServer = () => {
  cachedYoga = null
  cachedPrisma = null
}

export const executeGraphQL = async <
  TServerContext extends Record<string, any> = Record<string, any>,
>(
  yoga: YogaServerInstance<Record<string, any>, TServerContext>,
  query: string,
  variables?: Record<string, any>
) => {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  return response.json()
}
