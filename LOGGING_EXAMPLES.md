# 📚 Exemplos Práticos de Logging

Este arquivo contém exemplos práticos de como usar o sistema de logging no StrategiQ.

## 🎯 Exemplos em Resolvers GraphQL

### Exemplo 1: Query com Logger do Contexto

```typescript
// src/graphql/types/User.ts
import { queryField, nonNull, stringArg } from 'nexus'

export const UserQuery = queryField('user', {
  type: 'User',
  args: {
    id: nonNull(stringArg()),
  },
  resolve: async (_root, args, ctx) => {
    // Logger já vem com traceId automaticamente
    ctx.logger.info({ userId: args.id }, 'Buscando usuário')

    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: args.id },
      })

      if (!user) {
        ctx.logger.warn({ userId: args.id }, 'Usuário não encontrado')
        throw new Error('User not found')
      }

      ctx.logger.info(
        { userId: args.id, email: user.email },
        'Usuário encontrado com sucesso',
      )

      return user
    } catch (error) {
      ctx.logger.error(
        {
          userId: args.id,
          error,
        },
        'Erro ao buscar usuário',
      )
      throw error
    }
  },
})
```

### Exemplo 2: Mutation com Performance Logging

```typescript
// src/graphql/types/User.ts
import { mutationField, nonNull, stringArg } from 'nexus'
import { createPerformanceLogger } from '../../lib/logger'

export const CreateUserMutation = mutationField('createUser', {
  type: 'User',
  args: {
    email: nonNull(stringArg()),
    name: nonNull(stringArg()),
  },
  resolve: async (_root, args, ctx) => {
    const perfLogger = createPerformanceLogger('create-user', {
      traceId: ctx.traceId,
    })

    ctx.logger.info({ email: args.email }, 'Iniciando criação de usuário')

    try {
      // Validação
      if (!args.email.includes('@')) {
        ctx.logger.warn({ email: args.email }, 'Email inválido fornecido')
        throw new Error('Invalid email')
      }

      // Criação do usuário
      const user = await ctx.prisma.user.create({
        data: {
          email: args.email,
          name: args.name,
        },
      })

      // Log de sucesso
      ctx.logger.info(
        { userId: user.id, email: user.email },
        'Usuário criado com sucesso',
      )

      // Log de performance
      perfLogger.end({ userId: user.id })

      return user
    } catch (error) {
      ctx.logger.error({ email: args.email, error }, 'Erro ao criar usuário')
      perfLogger.error(error as Error)
      throw error
    }
  },
})
```

### Exemplo 3: Usando Helper de Database Query

```typescript
// src/graphql/types/User.ts
import { queryField } from 'nexus'
import { logDatabaseQuery } from '../../lib/logger/helpers'

export const UsersQuery = queryField('users', {
  type: list('User'),
  resolve: async (_root, _args, ctx) => {
    const dbLog = logDatabaseQuery(
      'SELECT',
      'User.findMany',
      {},
      ctx.traceId,
    )

    try {
      const users = await ctx.prisma.user.findMany()
      dbLog.success({ count: users.length })
      return users
    } catch (error) {
      dbLog.error(error as Error)
      throw error
    }
  },
})
```

## 🔌 Exemplos em Serviços Externos

### Exemplo 4: Chamada a API Externa

```typescript
// src/services/github.service.ts
import { logger, createContextLogger } from '../lib/logger'
import { logExternalCall } from '../lib/logger/helpers'

export class GitHubService {
  async getUser(username: string, traceId?: string) {
    const apiLog = logExternalCall(
      'GitHub',
      `/users/${username}`,
      'GET',
      traceId,
    )

    const reqLogger = traceId
      ? createContextLogger({ traceId, service: 'github' })
      : logger

    reqLogger.info({ username }, 'Buscando usuário no GitHub')

    try {
      const response = await fetch(`https://api.github.com/users/${username}`)

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`)
      }

      const data = await response.json()
      apiLog.success(response.status, { username: data.login })

      return data
    } catch (error) {
      apiLog.error(error as Error)
      throw error
    }
  }
}
```

## 📊 Exemplos de Eventos de Negócio

### Exemplo 5: Log de Eventos Importantes

```typescript
// src/graphql/types/Order.ts
import { mutationField, nonNull, stringArg } from 'nexus'
import { logBusinessEvent } from '../../lib/logger/helpers'

export const CreateOrderMutation = mutationField('createOrder', {
  type: 'Order',
  args: {
    userId: nonNull(stringArg()),
    productId: nonNull(stringArg()),
  },
  resolve: async (_root, args, ctx) => {
    const order = await ctx.prisma.order.create({
      data: {
        userId: args.userId,
        productId: args.productId,
        status: 'PENDING',
      },
    })

    // Log de evento de negócio
    logBusinessEvent(
      'order.created',
      {
        orderId: order.id,
        userId: args.userId,
        productId: args.productId,
        amount: order.amount,
      },
      ctx.traceId,
    )

    // Envia notificação
    await sendOrderNotification(order)

    logBusinessEvent(
      'order.notification.sent',
      { orderId: order.id },
      ctx.traceId,
    )

    return order
  },
})
```

## 🐛 Exemplos de Error Handling

### Exemplo 6: Log Estruturado de Erros

```typescript
// src/graphql/types/Payment.ts
import { mutationField, nonNull, stringArg, floatArg } from 'nexus'
import { logError } from '../../lib/logger/helpers'

export const ProcessPaymentMutation = mutationField('processPayment', {
  type: 'Payment',
  args: {
    orderId: nonNull(stringArg()),
    amount: nonNull(floatArg()),
  },
  resolve: async (_root, args, ctx) => {
    try {
      // Busca pedido
      const order = await ctx.prisma.order.findUnique({
        where: { id: args.orderId },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Processa pagamento
      const payment = await processPayment(order, args.amount)

      return payment
    } catch (error) {
      // Log rico de erro
      logError(error as Error, {
        traceId: ctx.traceId,
        operation: 'process-payment',
        metadata: {
          orderId: args.orderId,
          amount: args.amount,
          errorType: (error as Error).name,
        },
      })

      throw error
    }
  },
})
```

## 🎭 Exemplo com Decorator

### Exemplo 7: Service com Decorator de Performance

```typescript
// src/services/user.service.ts
import { LogExecutionTime } from '../lib/logger/helpers'
import { logger } from '../lib/logger'
import type { PrismaClient } from '@prisma/client'

export class UserService {
  constructor(private prisma: PrismaClient) {}

  @LogExecutionTime(logger)
  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    })
  }

  @LogExecutionTime(logger)
  async create(data: { email: string; name: string }) {
    return await this.prisma.user.create({
      data,
    })
  }

  @LogExecutionTime(logger)
  async updateProfile(id: string, data: { name?: string; bio?: string }) {
    return await this.prisma.user.update({
      where: { id },
      data,
    })
  }
}

// Uso:
const userService = new UserService(prisma)
const user = await userService.findById('123')
// Log automático: "UserService.findById completed in 45ms"
```

## 🔍 Rastreamento de Requisições com Trace ID

### Exemplo 8: Rastreando Requisição Completa

```typescript
// Cenário: Uma requisição GraphQL que passa por múltiplos serviços

// 1. Request chega no servidor (middleware automático)
// [abc-123] POST /graphql

// 2. Resolver processa
export const ComplexQuery = queryField('dashboard', {
  type: 'Dashboard',
  resolve: async (_root, _args, ctx) => {
    // traceId já está no contexto
    ctx.logger.info('Iniciando busca de dashboard')

    // 3. Chama serviço de usuário
    const userService = new UserService(ctx.prisma)
    const user = await userService.getCurrentUser(ctx.traceId)

    // 4. Chama API externa
    const githubService = new GitHubService()
    const githubData = await githubService.getUser(user.username, ctx.traceId)

    // 5. Busca dados do banco
    const dbLog = logDatabaseQuery('SELECT', 'stats', {}, ctx.traceId)
    const stats = await ctx.prisma.stats.findMany()
    dbLog.success({ count: stats.length })

    ctx.logger.info('Dashboard montado com sucesso')

    return {
      user,
      github: githubData,
      stats,
    }
  },
})

// Todos os logs terão o mesmo traceId [abc-123], permitindo
// rastrear toda a requisição de ponta a ponta!
```

## 📈 Exemplo de Monitoramento em Produção

### Exemplo 9: Configuração para Produção

```env
# .env.production
NODE_ENV=production
LOG_LEVEL=info
LOG_ROTATION_ENABLED=true
LOG_DIR=/var/log/strategiq
LOG_FILENAME=app.log
LOG_FREQUENCY=daily
LOG_MAX_FILES=30
LOG_MAX_SIZE=100M
```

Os logs em produção serão em JSON:

```json
{
  "level": "info",
  "timestamp": "2025-10-21T12:34:56.789Z",
  "traceId": "abc-123",
  "userId": "user-456",
  "operation": "create-order",
  "orderId": "order-789",
  "amount": 99.99,
  "msg": "Pedido criado com sucesso",
  "service": "strategiq-api",
  "env": "production",
  "duration": 234
}
```

Facilita integração com ferramentas de monitoramento como:
- Datadog
- New Relic
- Elastic Stack (ELK)
- CloudWatch
- Grafana Loki

## 💡 Dicas Finais

1. **Sempre use o logger do contexto** nos resolvers GraphQL
2. **Inclua dados estruturados** ao invés de concatenar strings
3. **Use níveis apropriados**: debug para desenvolvimento, info para eventos normais, error para erros
4. **Adicione trace IDs** em todas operações assíncronas e chamadas externas
5. **Log eventos de negócio** importantes para analytics e auditoria
6. **Evite logar informações sensíveis** como senhas, tokens, dados de cartão
7. **Use performance logging** para operações críticas
