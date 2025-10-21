import { scalarType } from 'nexus';

export const DateTime = scalarType({
  name: 'DateTime',
  asNexusMethod: 'dateTime',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value as string);
  },
  serialize(value) {
    return (value as Date).toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    return null;
  },
});
