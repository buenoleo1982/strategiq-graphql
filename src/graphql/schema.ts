import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from './types';

export const schema = makeSchema({
  types,
  outputs: {
    schema: join(process.cwd(), 'src', 'graphql', 'schema.graphql'),
    typegen: join(process.cwd(), 'src', 'graphql', 'nexus-typegen.ts'),
  },
  contextType: {
    module: join(process.cwd(), 'src', 'context.ts'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
});
