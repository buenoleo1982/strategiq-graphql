import { createYoga } from 'graphql-yoga'
import { createContext } from './src/context'
import { schema } from './src/graphql/schema'

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'StrategiQ GraphQL API',
  },
})

const port = process.env.PORT || 4000

const _server = Bun.serve({
  port,
  fetch: yoga.fetch,
})

console.log(`🚀 Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`)
