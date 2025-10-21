import { createYoga } from 'graphql-yoga'
import { createContext } from './context'
import { schema } from './graphql/schema'
import { logger } from './lib/logger'
import { createLoggingFetch } from './lib/logger/middleware'
import { env } from './support/config'

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'StrategiQ GraphQL API',
  },
  logging: {
    debug: (...args) => logger.debug(args),
    info: (...args) => logger.info(args),
    warn: (...args) => logger.warn(args),
    error: (...args) => logger.error(args),
  },
})

const port = env.PORT

const _server = Bun.serve({
  port,
  fetch: createLoggingFetch(yoga.fetch),
})

logger.info(
  {
    port,
    endpoint: yoga.graphqlEndpoint, //FIXME: talvez não seja necessário, visto que sempre será a mesma rota
    env: env.NODE_ENV,
  },
  `🚀 Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`
)
