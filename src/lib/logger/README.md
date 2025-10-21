# Sistema de Logging - StrategiQ API

Sistema de logging robusto baseado em Pino com suporte a trace IDs, logs estruturados, e rotação de arquivos.

## 📋 Características

- ✅ Logs estruturados em JSON (produção) ou formatados (desenvolvimento)
- ✅ Trace IDs automáticos para rastreamento de requisições
- ✅ Diferentes níveis de log por ambiente
- ✅ Rotação automática de logs
- ✅ Performance logging para operações críticas
- ✅ Integração com GraphQL Yoga
- ✅ Helpers para casos de uso comuns

## 🚀 Uso Básico

### Logger Simples

```typescript
import { logger } from './lib/logger'

// Logs simples
logger.info('Servidor iniciado')
logger.error('Erro ao processar requisição')
logger.debug('Dados de debug', { userId: '123' })
```

### Logger com Contexto

```typescript
import { createContextLogger } from './lib/logger'

const reqLogger = createContextLogger({
  traceId: '123-456',
  userId: 'abc'
})

reqLogger.info('Processando requisição do usuário')
```

### No Context do GraphQL

O logger já está disponível automaticamente no contexto:

```typescript
// src/graphql/types/User.ts
export const UserQuery = queryField('user', {
  type: 'User',
  args: { id: nonNull(stringArg()) },
  resolve: async (_root, args, ctx) => {
    ctx.logger.info({ userId: args.id }, 'Buscando usuário')

    const user = await ctx.prisma.user.findUnique({
      where: { id: args.id }
    })

    ctx.logger.info({ userId: args.id }, 'Usuário encontrado')
    return user
  }
})
```

## 🔧 Helpers Avançados

### Performance Logging

```typescript
import { createPerformanceLogger } from './lib/logger'

const perfLogger = createPerformanceLogger('database-query', { traceId })

const result = await prisma.user.findMany()

perfLogger.end({ count: result.length })
// Log: "database-query completed in 45ms"
```

### Database Queries

```typescript
import { logDatabaseQuery } from './lib/logger/helpers'

const dbLog = logDatabaseQuery('SELECT', 'users', { id: '123' }, traceId)

try {
  const user = await prisma.user.findUnique({ where: { id: '123' } })
  dbLog.success(user)
} catch (error) {
  dbLog.error(error)
}
```

### External API Calls

```typescript
import { logExternalCall } from './lib/logger/helpers'

const apiLog = logExternalCall('GitHub', '/api/users', 'GET', traceId)

try {
  const response = await fetch('https://api.github.com/users')
  apiLog.success(response.status, await response.json())
} catch (error) {
  apiLog.error(error)
}
```

### Business Events

```typescript
import { logBusinessEvent } from './lib/logger/helpers'

logBusinessEvent('user.created', {
  userId: '123',
  email: 'user@example.com'
}, traceId)
```

### Error Logging

```typescript
import { logError } from './lib/logger/helpers'

try {
  // código...
} catch (error) {
  logError(error, {
    traceId,
    userId: '123',
    operation: 'create-user',
    metadata: { email: 'user@example.com' }
  })
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Nível de log (trace | debug | info | warn | error | fatal)
LOG_LEVEL=debug

# Rotação de logs
LOG_ROTATION_ENABLED=true
LOG_DIR=./logs
LOG_FILENAME=app.log
LOG_FREQUENCY=daily
LOG_MAX_FILES=7
LOG_MAX_SIZE=10M
```

### Níveis de Log por Ambiente

- **Desenvolvimento**: `debug` - Todos os logs incluindo debug
- **Produção**: `info` - Apenas info, warn, error, fatal

## 📊 Formato dos Logs

### Desenvolvimento (Pretty)

```
[12:34:56.789] INFO [abc-123]: Processando requisição do usuário
  userId: "123"
  operation: "getUser"
```

### Produção (JSON)

```json
{
  "level": "info",
  "timestamp": "2025-10-21T12:34:56.789Z",
  "traceId": "abc-123",
  "userId": "123",
  "operation": "getUser",
  "msg": "Processando requisição do usuário",
  "service": "strategiq-api",
  "env": "production"
}
```

## 🎯 Trace IDs

Cada requisição recebe um trace ID único que:

1. É extraído do header `X-Trace-Id`, `X-Request-Id`, ou `X-Correlation-Id`
2. Se não existir, é gerado automaticamente (UUID v4)
3. É incluído em todos os logs da requisição
4. É retornado no response header `X-Trace-Id`

Isso permite rastrear uma requisição através de toda a stack.

## 🔄 Rotação de Logs

Quando habilitada (`LOG_ROTATION_ENABLED=true`), os logs são:

- Salvos em arquivos no diretório especificado
- Rotacionados automaticamente por frequência (daily/hourly)
- Limitados por tamanho máximo e número de arquivos
- Comprimidos após rotação

Exemplo de estrutura:

```
logs/
  app.log              # Log atual
  app.log.2025-10-21   # Logs de 21/10
  app.log.2025-10-20   # Logs de 20/10
```

## 🧪 Testing

O logger está configurado para ser **silencioso durante os testes** (modo `silent`), não poluindo a saída dos testes.

```typescript
import { logger } from './lib/logger'
import { test } from 'bun:test'

test('should log correctly', () => {
  logger.info('Test log')
  // Logger está disponível mas silencioso em testes
  // Nenhum log aparecerá no console durante testes
})
```

Para habilitar logs durante testes (útil para debugging):

```bash
LOG_LEVEL=debug bun test
```

## 🐛 Debugging

Para ver logs de debug, configure:

```env
LOG_LEVEL=debug
```

Ou temporariamente:

```bash
LOG_LEVEL=debug bun run dev
```

## 📝 Boas Práticas

1. **Use o logger do contexto** nos resolvers GraphQL
2. **Adicione trace ID** em todas operações assíncronas
3. **Log eventos de negócio** importantes
4. **Use níveis apropriados**:
   - `trace`: Informações muito detalhadas
   - `debug`: Informações de debugging
   - `info`: Eventos normais da aplicação
   - `warn`: Situações que podem ser problemáticas
   - `error`: Erros que precisam atenção
   - `fatal`: Erros críticos que causam shutdown
5. **Evite logs excessivos** em loops ou operações frequentes
6. **Use structured logging** ao invés de concatenar strings

## ❌ Anti-patterns

```typescript
// ❌ NÃO faça isso
logger.info('User ' + userId + ' created')

// ✅ Faça isso
logger.info({ userId }, 'User created')

// ❌ NÃO faça isso
console.log('Something happened')

// ✅ Faça isso
logger.info('Something happened')
```
