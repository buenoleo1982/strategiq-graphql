import type { Logger } from 'pino'
import { createContextLogger, logger } from './index'

/**
 * Decorator para logar tempo de execução de métodos
 *
 * @example
 * class UserService {
 *   @LogExecutionTime()
 *   async getUser(id: string) {
 *     return await db.user.findUnique({ where: { id } })
 *   }
 * }
 */
export function LogExecutionTime(loggerInstance: Logger = logger) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      const className = target.constructor.name

      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - startTime

        loggerInstance.debug(
          {
            class: className,
            method: propertyKey,
            duration,
            type: 'performance',
          },
          `${className}.${propertyKey} completed in ${duration}ms`
        )

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        loggerInstance.error(
          {
            class: className,
            method: propertyKey,
            duration,
            error,
            type: 'performance',
          },
          `${className}.${propertyKey} failed after ${duration}ms`
        )

        throw error
      }
    }

    return descriptor
  }
}

/**
 * Helper para logar operações de banco de dados
 */
export function logDatabaseQuery(operation: string, query: string, params?: any, traceId?: string) {
  const loggerInstance = traceId ? createContextLogger({ traceId }) : logger

  const startTime = Date.now()

  return {
    success: (result?: any) => {
      const duration = Date.now() - startTime
      loggerInstance.info(
        {
          type: 'database',
          operation,
          query,
          params,
          duration,
          result,
        },
        `DB ${operation} completed in ${duration}ms`
      )
    },
    error: (error: Error) => {
      const duration = Date.now() - startTime
      loggerInstance.error(
        {
          type: 'database',
          operation,
          query,
          params,
          duration,
          error,
        },
        `DB ${operation} failed after ${duration}ms: ${error.message}`
      )
    },
  }
}

/**
 * Helper para logar chamadas externas (APIs, etc)
 */
export function logExternalCall(
  service: string,
  endpoint: string,
  method: string,
  traceId?: string
) {
  const loggerInstance = traceId ? createContextLogger({ traceId }) : logger
  const startTime = Date.now()

  return {
    success: (statusCode: number, _data?: any) => {
      const duration = Date.now() - startTime
      loggerInstance.info(
        {
          type: 'external-call',
          service,
          endpoint,
          method,
          statusCode,
          duration,
        },
        `${service} ${method} ${endpoint} - ${statusCode} (${duration}ms)`
      )
    },
    error: (error: Error, statusCode?: number) => {
      const duration = Date.now() - startTime
      loggerInstance.error(
        {
          type: 'external-call',
          service,
          endpoint,
          method,
          statusCode,
          duration,
          error,
        },
        `${service} ${method} ${endpoint} failed after ${duration}ms: ${error.message}`
      )
    },
  }
}

/**
 * Helper para logar eventos de negócio
 */
export function logBusinessEvent(event: string, metadata?: Record<string, any>, traceId?: string) {
  const loggerInstance = traceId ? createContextLogger({ traceId }) : logger

  loggerInstance.info(
    {
      type: 'business-event',
      event,
      ...metadata,
    },
    `Business event: ${event}`
  )
}

/**
 * Helper para logar erros com contexto rico
 */
export function logError(
  error: Error,
  context?: {
    traceId?: string
    userId?: string
    operation?: string
    metadata?: Record<string, any>
  }
) {
  const loggerInstance = context?.traceId
    ? createContextLogger({ traceId: context.traceId })
    : logger

  loggerInstance.error(
    {
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userId: context?.userId,
      operation: context?.operation,
      ...context?.metadata,
    },
    `Error: ${error.message}`
  )
}

/**
 * Helper para criar um logger de request específico
 * Já inclui automaticamente o traceId e informações de usuário
 */
export function createRequestLogger(request: Request, userId?: string) {
  const traceId = request.headers.get('x-trace-id') || undefined

  return createContextLogger({
    traceId,
    userId,
    url: request.url,
    method: request.method,
  })
}
