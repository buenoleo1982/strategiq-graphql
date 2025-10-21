import type { LoggerOptions } from 'pino'
import pino from 'pino'
import type pinoPretty from 'pino-pretty'
import { isDev, isTesting } from '@/support'
import { env } from '@/support/config'

/**
 * Níveis de log disponíveis
 */
export const LOG_LEVELS = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS]

/**
 * Configuração do ambiente
 */
const logLevel = (process.env.LOG_LEVEL ||
  (isTesting ? 'silent' : isDev ? 'debug' : 'info')) as LogLevel

/**
 * Configuração base do Pino para produção
 * Logs em JSON estruturado para fácil parsing
 */
const productionConfig: LoggerOptions = {
  level: isTesting ? 'silent' : logLevel,
  formatters: {
    level: label => ({ level: label }),
    bindings: bindings => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
    }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  // Serializers customizados para objetos específicos
  serializers: {
    req: (req: any) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers?.host,
        'user-agent': req.headers?.['user-agent'],
        'content-type': req.headers?.['content-type'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  // Base para contexto global
  base: {
    env: env.NODE_ENV,
    service: 'strategiq-api',
  },
}

/**
 * Configuração para desenvolvimento
 * Logs coloridos e formatados para melhor leitura
 */
const developmentConfig: LoggerOptions = {
  ...productionConfig,
  transport: isTesting
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{if traceId}[{traceId}] {end}{msg}',
          errorLikeObjectKeys: ['err', 'error'],
          singleLine: false,
        } satisfies pinoPretty.PrettyOptions,
      },
}

/**
 * Configuração para testes
 * Logs silenciosos para não poluir output dos testes
 */
const testConfig: LoggerOptions = {
  level: 'silent',
  enabled: false,
}

/**
 * Exporta a configuração baseada no ambiente
 */
export const loggerConfig = isTesting ? testConfig : isDev ? developmentConfig : productionConfig

/**
 * Tipo para contexto de logging
 */
export interface LogContext {
  traceId?: string
  userId?: string
  sessionId?: string
  operationName?: string
  [key: string]: any
}
