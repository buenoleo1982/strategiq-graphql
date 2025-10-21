import type { BaseContext, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server'
import { ApolloServer } from '@apollo/server'
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@as-integrations/fastify'
import cors from '@fastify/cors'
import fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { createContext } from './context'
import { schema } from './graphql/schema'
import { logger } from './lib/logger'
import { env } from './support/config'

const app = fastify({ logger: false })

// Registrar CORS
await app.register(cors, {
  origin: true,
  credentials: true,
})

// Criar instância do Apollo Server
const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    fastifyApolloDrainPlugin(app),
    {
      requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
        return Promise.resolve({
          didResolveOperation(requestContext: GraphQLRequestContext<BaseContext>): Promise<void> {
            logger.info(
              {
                query: requestContext.request.query,
                variables: requestContext.request.variables,
                operationName: requestContext.request.operationName,
              },
              'GraphQL Operation'
            )
            return Promise.resolve()
          },
          didEncounterErrors(requestContext: GraphQLRequestContext<BaseContext>): Promise<void> {
            logger.error(
              {
                errors: requestContext.errors,
                query: requestContext.request.query,
              },
              'GraphQL Errors'
            )
            return Promise.resolve()
          },
        })
      },
    },
  ],
})

await server.start()

// Registrar rota GraphQL usando fastifyApolloHandler
app.route({
  url: '/graphql',
  method: ['GET', 'POST', 'OPTIONS'],
  handler: fastifyApolloHandler(server, {
    context: async (request: FastifyRequest, reply: FastifyReply) => {
      return createContext({ req: request, res: reply })
    },
  }),
})

// Redirecionar rota raiz para GraphQL endpoint
app.get('/', async (_, reply) => {
  reply.redirect('/graphql')
})

const PORT = env.PORT

// Iniciar servidor
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    logger.error(err, 'Erro ao iniciar servidor')
    process.exit(1)
  }
  logger.info(`🚀 Servidor GraphQL rodando em ${address}/graphql`)
})
