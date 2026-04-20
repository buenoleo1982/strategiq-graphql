import { ApolloServer } from '@apollo/server'
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@as-integrations/fastify'
import cors from '@fastify/cors'
import fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { createContext } from './context'
import { schema } from './graphql/schema'
import { logger } from './lib/logger'
import { MinioStorageService } from './lib/storage/minio'
import { registerEvidenceRoutes } from './routes/evidences'
import { env } from './support/config'

const app = fastify({ logger: false })

// Registrar CORS
await app.register(cors, {
  origin: true,
  credentials: true,
})

await registerEvidenceRoutes(app)

// Criar instância do Apollo Server
const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [fastifyApolloDrainPlugin(app)],
})

await server.start()

const evidenceBucketReady = await MinioStorageService.warmupEvidenceBucket()

if (!evidenceBucketReady) {
  logger.warn(
    {
      endpoint: `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
      bucket: MinioStorageService.bucketName,
    },
    'MinIO indisponível no startup; o bucket de evidências será inicializado no primeiro upload'
  )
}

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
