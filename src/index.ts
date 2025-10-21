import { createYoga } from 'graphql-yoga'
import { createContext } from './context'
import { schema } from './graphql/schema'
import { logger } from './lib/logger'
import { createLoggingFetch } from './lib/logger/middleware'

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

const port = process.env.PORT || 4000

const _server = Bun.serve({
  port,
  fetch: createLoggingFetch(yoga.fetch),
})

logger.info(
  {
    port,
    endpoint: yoga.graphqlEndpoint,
    env: process.env.NODE_ENV || 'development',
  },
  `🚀 Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`
)
