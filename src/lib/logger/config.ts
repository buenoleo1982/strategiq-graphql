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
 * Hook para filtrar logs de introspection do Apollo Server
 * Remove logs verbosos de IntrospectionQuery que poluem o output
 */
function shouldFilterLog(obj: any): boolean {
  // Filtra logs de IntrospectionQuery do Apollo Server
  if (obj.operationName === 'IntrospectionQuery') {
    return true
  }

  // Filtra logs de health checks e outras operações internas
  if (obj.msg?.includes('GraphQL Operation') && obj.query?.includes('__schema')) {
    return true
  }

  return false
}

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
  // Hook para filtrar logs
  hooks: {
    logMethod(args, method) {
      // Se o primeiro argumento é um objeto e deve ser filtrado, não loga
      if (args.length > 0 && typeof args[0] === 'object' && shouldFilterLog(args[0])) {
        return
      }
      method.apply(this, args)
    },
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
  level: isTesting ? 'silent' : logLevel,
  formatters: {
    level: label => ({ level: label }),
    bindings: bindings => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
    }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
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
  // Hook para filtrar logs em desenvolvimento também
  hooks: {
    logMethod(args, method) {
      // Se o primeiro argumento é um objeto e deve ser filtrado, não loga
      if (args.length > 0 && typeof args[0] === 'object' && shouldFilterLog(args[0])) {
        return
      }
      method.apply(this, args)
    },
  },
  base: {
    env: env.NODE_ENV,
    service: 'strategiq-api',
  },
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
