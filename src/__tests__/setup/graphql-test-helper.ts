import type { PrismaClient } from '@prisma/client'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { Context } from '../../context'
import { schema } from '../../graphql/schema'
import { createContextLogger } from '../../lib/logger'
import { generateTraceId } from '../../lib/logger/trace'

// Cache the Yoga instance to avoid recreating it for each test
let cachedYoga: YogaServerInstance<Record<string, any>, Context> | null = null
let cachedPrisma: PrismaClient | null = null

export const createTestServer = (prisma: PrismaClient) => {
  // Reuse cached instance if Prisma client is the same
  if (cachedYoga && cachedPrisma === prisma) {
    return cachedYoga
  }

  // Create new instance
  cachedYoga = createYoga<Record<string, any>, Context>({
    schema,
    context: () => ({
      prisma,
      logger: createContextLogger({ traceId: generateTraceId() }),
      traceId: generateTraceId(),
    }),
    logging: false, // Disable logging in tests
    maskedErrors: false, // Show real errors in tests (useful for debugging)
  })

  cachedPrisma = prisma
  return cachedYoga
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
