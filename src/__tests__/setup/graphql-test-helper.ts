import type { PrismaClient } from '@prisma/client'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { Context } from '../../context'
import { schema } from '../../graphql/schema'

export const createTestServer = (prisma: PrismaClient) => {
  return createYoga<Record<string, any>, Context>({
    schema,
    context: () => ({ prisma }),
    logging: false, // Disable logging in tests
    maskedErrors: false, // Show real errors in tests (useful for debugging)
  })
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
