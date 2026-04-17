import { ApolloServer } from '@apollo/server'
import type { PrismaClient } from '@prisma/client'
import type { GraphQLSchema } from 'graphql'
import { schema } from '../../graphql/schema'
import { createContextLogger } from '../../lib/logger'
import { generateTraceId } from '../../lib/logger/trace'
import type { Context } from '../../types.d.ts'
import type { AuthenticatedUser } from '../../types/auth'

export interface CreateTestServerOptions {
  prisma: PrismaClient
  currentUser?: AuthenticatedUser | null
}

export const createTestServer = async (
  prismaOrOptions: PrismaClient | CreateTestServerOptions,
  optionsOverride?: Partial<CreateTestServerOptions>
) => {
  // Check if it's options object (has prisma property) or direct PrismaClient
  let options: CreateTestServerOptions =
    'prisma' in prismaOrOptions ? prismaOrOptions : { prisma: prismaOrOptions, currentUser: null }

  // Apply overrides if provided
  if (optionsOverride) {
    options = { ...options, ...optionsOverride }
  }

  const { prisma, currentUser = null } = options

  // Create new Apollo Server instance for each test to ensure isolation
  const server = new ApolloServer<Context>({
    schema: schema as GraphQLSchema,
  })

  // Start the server
  await server.start()

  return {
    server,
    executeOperation: async (query: string, variables?: Record<string, any>) => {
      const traceId = generateTraceId()
      const context: Context = {
        prisma,
        logger: createContextLogger({ traceId }),
        traceId,
        currentUser,
        req: {} as any, // Mock FastifyRequest for tests
        res: {} as any, // Mock FastifyReply for tests,
        services: {
          pagination: {
            parsePagination: (args?: { skip?: number; take?: number } | null) => ({
              page: args?.skip ?? 0,
              limit: args?.take ?? 10,
            }),
            getPagination: async (prismaModel: any, pageArgs?: { skip?: number; take?: number } | null) => {
              const totalCount = await prismaModel.count()
              const { page, limit } = {
                page: pageArgs?.skip ?? 0,
                limit: pageArgs?.take ?? 10,
              }

              return {
                totalCount,
                page: page + 1,
                pageSize: limit,
                hasMore: (page + 1) * limit < totalCount,
              };
            },
          },
        },
      }

      return server.executeOperation(
        {
          query,
          variables,
        },
        {
          contextValue: context,
        }
      )
    },
  }
}

export const executeGraphQL = async (
  testServer: Awaited<ReturnType<typeof createTestServer>>,
  query: string,
  variables?: Record<string, any>
): Promise<any> => {
  const result = await testServer.executeOperation(query, variables)

  // Apollo Server retorna o resultado no formato { body: { kind: 'single', singleResult: ... } }
  if (result.body.kind === 'single') {
    return result.body.singleResult
  }

  // Para outros tipos de resultado, retorna o resultado completo
  return result
}
