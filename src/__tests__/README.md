# 🧪 Guia de Testes - StrategiQ API

Este guia explica como escrever testes rápidos e eficientes na aplicação.

## 📊 Performance dos Testes

**Antes das otimizações**: ~1020ms
**Depois das otimizações**: ~950ms
**Melhoria**: ~7% mais rápido

### Otimizações Implementadas

1. ✅ **Limpeza otimizada do banco** - `deleteMany()` direto ao invés de query dinâmica
2. ✅ **Reuso da instância Yoga** - Cache da instância GraphQL entre testes
3. ✅ **Conexão única** - Uma conexão Prisma para todos os testes
4. ✅ **Schema push condicional** - Apenas se o banco não existe

## 🚀 Estratégias de Teste

### 1️⃣ Estratégia Padrão (Recomendada)

Usa `deleteMany()` entre testes. Rápido e confiável.

```typescript
import { setupTestDatabase } from '../setup/test-context'
import { createTestServer, executeGraphQL } from '../setup/graphql-test-helper'

describe('My Feature', () => {
  const { getContext } = setupTestDatabase()

  it('should work', async () => {
    const ctx = getContext()
    const yoga = createTestServer(ctx.prisma)

    // Seu teste aqui...
  })
})
```

**Prós:**
- ✅ Simples e direto
- ✅ Funciona com transações dentro dos testes
- ✅ Isolamento completo entre testes

**Contras:**
- ⚠️ Um pouco mais lento que transações (mas ainda rápido)

### 2️⃣ Estratégia Transacional (Avançada)

Usa BEGIN/ROLLBACK entre testes. Mais rápido, mas com limitações.

```typescript
import { setupTestDatabaseWithTransactions } from '../setup/test-context-transactional'
import { createTestServer, executeGraphQL } from '../setup/graphql-test-helper'

describe('My Feature', () => {
  const { getContext } = setupTestDatabaseWithTransactions()

  it('should work', async () => {
    const ctx = getContext()
    const yoga = createTestServer(ctx.prisma)

    // Seu teste aqui...
  })
})
```

**Prós:**
- ✅ 10-20x mais rápido que DELETE
- ✅ Isolamento perfeito
- ✅ Rollback automático

**Contras:**
- ⚠️ **Não funciona** se o teste usa transações internas
- ⚠️ **SQLite** tem limitações com transações aninhadas
- ⚠️ Mais complexo para debugar

**Quando usar:**
- ✅ Testes simples de queries/mutations
- ✅ Não usa `prisma.$transaction()` no código
- ✅ Performance é crítica (suítes com 100+ testes)

**Quando NÃO usar:**
- ❌ Testes que usam transações no código
- ❌ Testes que precisam simular rollback
- ❌ Testes com operações concorrentes

## 📝 Boas Práticas

### ✅ DO: Reuse o servidor GraphQL

```typescript
describe('My Feature', () => {
  const { getContext } = setupTestDatabase()

  it('test 1', async () => {
    const ctx = getContext()
    const yoga = createTestServer(ctx.prisma) // Cache automático!
    // ...
  })

  it('test 2', async () => {
    const ctx = getContext()
    const yoga = createTestServer(ctx.prisma) // Reutiliza a mesma instância
    // ...
  })
})
```

### ✅ DO: Cleanup explícito quando necessário

```typescript
import { resetTestServer } from '../setup/graphql-test-helper'

afterAll(() => {
  resetTestServer() // Limpa cache se necessário
})
```

### ❌ DON'T: Criar nova instância desnecessariamente

```typescript
// ❌ Ruim - cria nova instância a cada teste
beforeEach(() => {
  yoga = createYoga({ schema, context })
})

// ✅ Bom - reutiliza automaticamente
it('test', async () => {
  const yoga = createTestServer(ctx.prisma)
})
```

### ❌ DON'T: Queries dinâmicas para limpeza

```typescript
// ❌ Muito lento
const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master`
for (const table of tables) {
  await prisma.$executeRawUnsafe(`DELETE FROM ${table.name}`)
}

// ✅ Rápido
await prisma.user.deleteMany()
await prisma.post.deleteMany()
```

## 🎯 Padrões de Teste

### Teste de Query

```typescript
it('should return users', async () => {
  const ctx = getContext()

  // Arrange: Cria dados de teste
  await ctx.prisma.user.createMany({
    data: [
      { name: 'User 1', email: 'user1@test.com' },
      { name: 'User 2', email: 'user2@test.com' },
    ]
  })

  const yoga = createTestServer(ctx.prisma)

  // Act: Executa query
  const result = await executeGraphQL(yoga, `
    query {
      users {
        id
        name
        email
      }
    }
  `)

  // Assert: Valida resultado
  expect(result.data.users).toHaveLength(2)
  expect(result.data.users[0].name).toBe('User 1')
})
```

### Teste de Mutation

```typescript
it('should create user', async () => {
  const ctx = getContext()
  const yoga = createTestServer(ctx.prisma)

  // Act
  const result = await executeGraphQL(yoga, `
    mutation CreateUser($name: String!, $email: String!) {
      createUser(name: $name, email: $email) {
        id
        name
        email
      }
    }
  `, {
    name: 'New User',
    email: 'new@test.com'
  })

  // Assert
  expect(result.data.createUser).toMatchObject({
    name: 'New User',
    email: 'new@test.com'
  })

  // Verify in DB
  const userInDb = await ctx.prisma.user.findUnique({
    where: { id: result.data.createUser.id }
  })
  expect(userInDb).toBeDefined()
})
```

### Teste de Erro

```typescript
it('should fail with invalid input', async () => {
  const ctx = getContext()
  const yoga = createTestServer(ctx.prisma)

  const result = await executeGraphQL(yoga, `
    mutation CreateUser($name: String!, $email: String!) {
      createUser(name: $name, email: $email) {
        id
      }
    }
  `, {
    name: '',
    email: 'invalid'
  })

  expect(result.errors).toBeDefined()
  expect(result.errors).toHaveLength(1)
  expect(result.data.createUser).toBeNull()
})
```

## 🔍 Debugging de Testes

### Ver logs durante testes

```bash
# Habilita logs do Pino
LOG_LEVEL=debug bun test

# Habilita logs do Prisma
DEBUG=prisma:* bun test
```

### Executar teste específico

```bash
# Por arquivo
bun test src/__tests__/graphql/User.test.ts

# Por nome do teste
bun test -t "should create user"

# Com watch mode
bun test --watch
```

### Isolar teste problemático

```typescript
// Foca em um teste específico
it.only('should work', async () => {
  // ...
})

// Pula testes temporariamente
it.skip('broken test', async () => {
  // ...
})
```

## 📈 Benchmarking

Para medir performance dos seus testes:

```bash
# Tempo total
bun test --run

# Com mais detalhes
bun test --reporter=verbose

# Profile de performance
bun test --profile
```

## 🎓 Recursos Adicionais

- [Vitest Docs](https://vitest.dev/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [GraphQL Yoga Testing](https://the-guild.dev/graphql/yoga-server/docs/features/testing)

## 🔄 Migrando Testes Existentes

Se você tem testes lentos, siga estes passos:

1. **Identifique o gargalo**:
   ```bash
   bun test --reporter=verbose
   ```

2. **Aplique otimizações**:
   - Use `setupTestDatabase()` ao invés de criar cliente Prisma manualmente
   - Reuse `createTestServer()` ao invés de criar novo
   - Use `deleteMany()` ao invés de queries dinâmicas

3. **Meça o ganho**:
   ```bash
   bun test --run
   # Antes: 1020ms
   # Depois: 950ms
   ```

4. **Se ainda lento, considere transações**:
   - Migre para `setupTestDatabaseWithTransactions()`
   - Ganho esperado: 50-80% de redução no tempo
