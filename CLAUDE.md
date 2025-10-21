# Regras e Padrões do Projeto StrategiQ Backend

Este documento contém as regras, padrões e convenções utilizadas no desenvolvimento do backend do projeto StrategiQ.

## 🛠️ Stack Tecnológica

### Runtime e Ferramentas
- **Runtime**: Bun (substituindo Node.js, npm, pnpm, yarn, vite)
- **Linguagem**: TypeScript (strict mode habilitado)
- **Framework GraphQL**: GraphQL Yoga + Nexus
- **ORM**: Prisma
- **Banco de Dados**: SQLite (desenvolvimento)
- **Cache**: Redis (via ioredis)
- **Autenticação**: JWT (via jose) + bcryptjs
- **Logging**: Pino + Pino Pretty
- **Testes**: Vitest
- **Linter/Formatter**: Biome

### Comandos do Projeto
```bash
bun dev              # Desenvolvimento com hot reload
bun test             # Testes em watch mode
bun test:run         # Executa testes uma vez
bun test:coverage    # Cobertura de testes
bun run check        # Valida lint, types, schema e testes
bun run schema:generate  # Gera schema GraphQL
```

## 📁 Estrutura de Diretórios

```
src/
├── __tests__/              # Testes
│   ├── setup/             # Configuração de testes
│   └── graphql/           # Testes GraphQL
├── graphql/               # Schema GraphQL
│   ├── resolvers/         # Resolvers organizados por domínio
│   │   ├── auth/
│   │   │   ├── mutation/  # Mutations de auth
│   │   │   └── query/     # Queries de auth
│   │   └── user/
│   │       ├── mutation/  # Mutations de user
│   │       └── query/     # Queries de user
│   ├── types/             # Tipos GraphQL (Nexus)
│   │   ├── auth/
│   │   │   ├── type.ts    # Definição de tipos
│   │   │   ├── query.ts   # Queries
│   │   │   └── mutation.ts # Mutations
│   │   └── user/
│   │       ├── type.ts
│   │       ├── query.ts
│   │       └── mutation.ts
│   ├── schema.ts          # Schema Nexus
│   └── schema.graphql     # Schema gerado (não editar)
├── lib/                   # Bibliotecas e serviços
│   ├── auth/             # Autenticação e autorização
│   │   ├── auth.service.ts   # Serviço de autenticação
│   │   ├── jwt.ts            # Serviço JWT
│   │   ├── password.ts       # Hash de senhas
│   │   └── guards.ts         # Guards de autorização
│   ├── cache/            # Cache (Redis)
│   └── logger/           # Sistema de logging
├── types/                # Tipos TypeScript
├── context.ts            # Contexto GraphQL
└── index.ts             # Entry point
```

## 🎨 Convenções de Código

### Biome Configuration

#### Formatação
- **Estilo de indentação**: Espaços
- **Tamanho da indentação**: 2 espaços
- **Largura de linha**: 100 caracteres
- **Line ending**: LF (Unix)
- **Aspas JavaScript**: Single quotes (`'`)
- **Aspas JSX**: Double quotes (`"`)
- **Ponto e vírgula**: Opcional (asNeeded)
- **Parênteses em arrow functions**: Opcional (asNeeded)
- **Trailing commas**: ES5
- **Bracket spacing**: true
- **Bracket same line**: false

#### Linting
- **Regras recomendadas**: Habilitadas
- **Imports não utilizados**: Error
- **`any` explícito**: Permitido (off)
- **Static-only classes**: Permitido
- **`this` em métodos estáticos**: Permitido

### TypeScript

#### Configuração (tsconfig.json)
- **Strict mode**: Habilitado
- **Target**: ESNext
- **Module**: Preserve
- **Module Resolution**: bundler
- **No unchecked indexed access**: true
- **No implicit override**: true
- **Path aliases**: `@/*` aponta para `src/*`

#### Convenções
- Use tipos explícitos em parâmetros de funções
- Use `type` ao invés de `interface` quando possível
- Prefira `const` ao invés de `let`
- Evite `any`, use tipos específicos ou `unknown`

### Nomenclatura

#### Arquivos
- **Componentes/Classes**: PascalCase (`UserService.ts`)
- **Utilitários**: kebab-case (`create-context.ts`)
- **Testes**: `*.test.ts` ou `*.spec.ts`
- **Tipos**: `*.types.ts` ou dentro de `/types`

#### Código
- **Variáveis e funções**: camelCase (`createUser`, `userId`)
- **Classes e tipos**: PascalCase (`User`, `AuthService`)
- **Constantes**: UPPER_SNAKE_CASE apenas para valores verdadeiramente constantes
- **Interfaces**: PascalCase sem prefixo `I` (`Context`, não `IContext`)

## 🔐 GraphQL com Nexus

### Organização

#### Estrutura por Domínio
Cada domínio (User, Auth, etc.) tem sua própria pasta com:
- `type.ts`: Definição dos tipos GraphQL
- `query.ts`: Queries do domínio
- `mutation.ts`: Mutations do domínio
- `index.ts`: Re-exporta todos os tipos

#### Resolvers Separados
- Resolvers ficam em `graphql/resolvers/[domínio]/[tipo]/[operação].ts`
- Cada resolver é uma função em arquivo separado
- Facilita testes e manutenção

### Padrões

#### Definição de Tipos
```typescript
import { objectType } from 'nexus'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('name')
    t.nonNull.string('email')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})
```

#### Queries
```typescript
import { extendType } from 'nexus'
import { UserQueryResolvers } from '@/graphql/resolvers'

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('users', {
      type: 'User',
      resolve: UserQueryResolvers.users,
    })
  },
})
```

#### Mutations
```typescript
import { extendType, nonNull, stringArg } from 'nexus'
import { UserMutationResolvers } from '@/graphql/resolvers'

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createUser', {
      type: 'User',
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: UserMutationResolvers.createUser,
    })
  },
})
```

#### Resolvers
```typescript
import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'

export const createUser: FieldResolver<'Mutation', 'createUser'> = async (
  _,
  { name, email, password },
  ctx
) => {
  requireAuth(ctx) // Guard de autenticação

  // Lógica do resolver
  return ctx.prisma.user.create({
    data: { name, email, password },
  })
}
```

## 🔒 Autenticação e Autorização

### JWT

#### Tokens
- **Access Token**: Expira em 15 minutos
- **Refresh Token**: Expira em 7 dias, armazenado no Redis
- **Algoritmo**: HS256
- **Biblioteca**: jose

#### Fluxo
1. **Registro**: `register` mutation retorna usuário + tokens
2. **Login**: `login` mutation retorna usuário + tokens
3. **Refresh**: `refreshToken` mutation valida refresh token e gera novos tokens
4. **Logout**: `logout` mutation remove refresh token do Redis e adiciona access token à blacklist

### Guards

#### `requireAuth(ctx)`
Valida se o usuário está autenticado. Lança `GraphQLError` com código `UNAUTHENTICATED` se não estiver.

```typescript
import { requireAuth } from '@/lib/auth/guards'

export const protectedResolver: FieldResolver<'Query', 'me'> = async (_, __, ctx) => {
  requireAuth(ctx)
  return ctx.currentUser
}
```

#### `requireOwnership(ctx, resourceUserId)`
Valida se o usuário é o dono do recurso. Lança `GraphQLError` com código `FORBIDDEN` se não for.

```typescript
import { requireOwnership } from '@/lib/auth/guards'

export const updateProfile: FieldResolver<'Mutation', 'updateProfile'> = async (
  _,
  { userId },
  ctx
) => {
  requireOwnership(ctx, userId)
  // Lógica de atualização
}
```

#### `isAuthenticated(ctx)`
Verifica autenticação sem lançar erro. Retorna `boolean`.

### Context

O contexto GraphQL contém:
```typescript
interface Context {
  prisma: PrismaClient      // Cliente Prisma
  logger: Logger            // Logger contextual
  traceId: string          // ID de rastreamento
  currentUser: AuthenticatedUser | null  // Usuário autenticado
  request: Request         // Request HTTP
}
```

## 📊 Prisma

### Padrões

#### Schema
- Use singular para nomes de models (`User`, não `Users`)
- Campo `id` sempre como `@id @default(autoincrement())`
- Timestamps: `createdAt` e `updatedAt` em todos os models
- Email sempre `@unique`

#### Queries
- Use transações quando necessário
- Prefira `select` ao invés de carregar todo o model
- Use `include` apenas quando necessário

#### Exemplo
```typescript
// Bom: Select específico
const user = await ctx.prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
})

// Evite: Carregar tudo desnecessariamente
const user = await ctx.prisma.user.findUnique({
  where: { id },
})
```

## 📝 Logging

### Pino

#### Uso Básico
```typescript
// Logger global
import { logger } from '@/lib/logger'
logger.info('Mensagem')

// Logger contextual (com traceId, etc)
import { createContextLogger } from '@/lib/logger'
const reqLogger = createContextLogger({ traceId: '123' })

// Logger de performance
import { createPerformanceLogger } from '@/lib/logger'
const perfLogger = createPerformanceLogger('database-query')
await doSomething()
perfLogger.end({ query: 'SELECT ...' })
```

#### Níveis
- `trace`: Detalhes extremamente verbosos
- `debug`: Informações de debug
- `info`: Informações gerais
- `warn`: Avisos
- `error`: Erros
- `fatal`: Erros fatais

#### Padrões
- Sempre use logger do contexto nos resolvers (`ctx.logger`)
- Inclua dados estruturados: `logger.info({ userId: 123 }, 'User created')`
- Não logue senhas ou tokens
- Use performance logger para operações críticas

## 🧪 Testes

### Vitest

#### Estrutura
- Testes ficam em `src/__tests__/`
- Organize por domínio: `graphql/`, `services/`, etc.
- Use `setupFiles` para configuração global

#### Helper para Testes GraphQL
```typescript
import { createTestServer, executeGraphQL } from '../setup/graphql-test-helper'
import { setupTestDatabase } from '../setup/test-context'

describe('User Queries', () => {
  const { getContext } = setupTestDatabase()

  it('should return all users', async () => {
    const ctx = getContext()
    const yoga = createTestServer(ctx.prisma)

    const query = `
      query {
        users {
          id
          name
        }
      }
    `

    const result = await executeGraphQL(yoga, query)
    expect(result.data.users).toBeDefined()
  })
})
```

#### Autenticação em Testes
```typescript
// Criar server com usuário autenticado
const yoga = createTestServer({
  prisma: ctx.prisma,
  currentUser: { id: 1, email: 'user@example.com', name: 'User' },
})
```

#### Padrões
- Use `describe` para agrupar testes relacionados
- Nomes descritivos: `should return error when user not found`
- Sempre limpe o banco após cada teste (feito automaticamente pelo helper)
- Teste casos de sucesso e erro
- Teste autenticação e autorização
- Use `expect` do Vitest

## 🚨 Tratamento de Erros

### GraphQL Errors

#### Códigos de Erro Padrão
- `UNAUTHENTICATED`: Usuário não autenticado
- `FORBIDDEN`: Usuário sem permissão
- `BAD_USER_INPUT`: Entrada inválida
- `NOT_FOUND`: Recurso não encontrado
- `INTERNAL_SERVER_ERROR`: Erro interno

#### Padrão
```typescript
import { GraphQLError } from 'graphql'

throw new GraphQLError('Mensagem de erro', {
  extensions: { code: 'UNAUTHENTICATED' },
})
```

#### Boas Práticas
- Mensagens claras e em português
- Use códigos apropriados
- Não exponha detalhes internos em produção
- Logue erros com contexto adequado

## 🔄 Cache com Redis

### Padrões

#### TokenCache
```typescript
import { TokenCache } from '@/lib/cache/redis'

// Armazenar refresh token
await TokenCache.storeRefreshToken(userId, token)

// Recuperar refresh token
const token = await TokenCache.getRefreshToken(userId)

// Remover refresh token
await TokenCache.removeRefreshToken(userId)

// Blacklist de access token
await TokenCache.blacklistToken(token, expiresInSeconds)

// Verificar blacklist
const isBlacklisted = await TokenCache.isTokenBlacklisted(token)
```

## 📦 Services

### Padrão de Service

Services são classes estáticas que encapsulam lógica de negócio:

```typescript
export class AuthService {
  /**
   * Realiza login do usuário
   */
  static async login(input: LoginInput): Promise<AuthTokens> {
    // Implementação
  }

  /**
   * Registra um novo usuário
   */
  static async register(name: string, email: string, password: string): Promise<User> {
    // Implementação
  }
}
```

#### Princípios
- Métodos estáticos
- Documentação JSDoc em todos os métodos públicos
- Separação de responsabilidades
- Não misturar lógica de negócio com GraphQL resolvers
- Reutilizável em diferentes contextos

## 🎯 Commits e Git

### Padrão de Commits

Use Gitmoji + mensagens descritivas:

```
✨ (feature): Implementa autenticação JWT
🔥 (remove): Remove arquivos antigos
♻️ (refactor): Padroniza arquivos GraphQL
🔧 (config): Adiciona script de geração de schema
🐛 (fix): Corrige validação de token
✅ (test): Adiciona testes para User mutations
📝 (docs): Atualiza documentação
```

### Branch
- `main`: Branch principal
- Features: criar branches descritivas (`feature/auth`, `fix/user-validation`)

## 📋 Checklist de Qualidade

Antes de fazer commit, execute:
```bash
bun run check
```

Este comando:
1. ✅ Executa lint com Biome
2. ✅ Valida tipos TypeScript
3. ✅ Gera schema GraphQL
4. ✅ Formata código
5. ✅ Executa todos os testes

## 🚀 Boas Práticas Gerais

### Performance
- Use `select` do Prisma para buscar apenas campos necessários
- Implemente cache quando apropriado
- Use DataLoader para evitar N+1 queries (quando necessário)
- Monitore queries lentas com performance logger

### Segurança
- Sempre faça hash de senhas com bcryptjs
- Valide e sanitize inputs
- Use guards para proteger resolvers
- Não exponha stack traces em produção
- Implemente rate limiting (futuro)

### Manutenibilidade
- Mantenha resolvers pequenos e focados
- Extraia lógica complexa para services
- Documente código não óbvio
- Escreva testes para features críticas
- Use tipos TypeScript adequadamente

### DX (Developer Experience)
- Use path aliases (`@/`) para imports limpos
- Organize código por domínio/feature
- Mantenha arquivos pequenos e focados
- Use hot reload durante desenvolvimento
- Documente decisões arquiteturais importantes

## 📚 Recursos e Documentação

### Ferramentas
- [Bun](https://bun.sh/)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Nexus](https://nexusjs.org/)
- [Prisma](https://www.prisma.io/)
- [Vitest](https://vitest.dev/)
- [Biome](https://biomejs.dev/)
- [Pino](https://getpino.io/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

**Última atualização**: 2025-10-21

Este documento é vivo e deve ser atualizado conforme o projeto evolui.
