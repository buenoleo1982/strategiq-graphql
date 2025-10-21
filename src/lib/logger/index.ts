import pino from 'pino'
import { type LogContext, loggerConfig } from './config'

/**
 * Logger principal da aplicação
 * Criado uma única vez e reutilizado em toda a aplicação
 */
export const logger = pino(loggerConfig)

/**
 * Cria um child logger com contexto adicional
 * Útil para adicionar informações de request, user, etc.
 *
 * @example
 * const reqLogger = createContextLogger({ traceId: '123', userId: 'abc' })
 * reqLogger.info('Processing request')
 */
export function createContextLogger(context: LogContext) {
  return logger.child(context)
}

/**
 * Logger de performance para medir tempo de execução
 *
 * @example
 * const perfLogger = createPerformanceLogger('database-query')
 * await doSomething()
 * perfLogger.end({ query: 'SELECT * FROM users' })
 */
export function createPerformanceLogger(operation: string, context?: LogContext) {
  const startTime = Date.now()
  const childLogger = context ? logger.child(context) : logger

  return {
    end: (metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime
      childLogger.info(
        {
          operation,
          duration,
          ...metadata,
        },
        `${operation} completed in ${duration}ms`
      )
      return duration
    },
    error: (error: Error, metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime
      childLogger.error(
        {
          operation,
          duration,
          error,
          ...metadata,
        },
        `${operation} failed after ${duration}ms`
      )
      return duration
    },
  }
}

/**
 * Re-exporta o logger configurado e tipos
 */
export { type LogContext, loggerConfig } from './config'
export type Logger = pino.Logger
