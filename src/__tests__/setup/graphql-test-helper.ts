import { createYoga } from 'graphql-yoga';
import { schema } from '../../graphql/schema';
import type { PrismaClient } from '@prisma/client';

export const createTestServer = (prisma: PrismaClient) => {
  return createYoga({
    schema,
    context: () => ({ prisma }),
    logging: false, // Disable logging in tests
    maskedErrors: false, // Show real errors in tests (useful for debugging)
  });
};

export const executeGraphQL = async (
  yoga: ReturnType<typeof createYoga>,
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
  });

  return response.json();
};
