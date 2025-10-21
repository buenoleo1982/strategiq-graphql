import { createYoga } from 'graphql-yoga';
import { schema } from './src/graphql/schema';
import { createContext } from './src/context';

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'StrategiQ GraphQL API',
  },
});

const port = process.env.PORT || 4000;

const server = Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(`🚀 Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`);
