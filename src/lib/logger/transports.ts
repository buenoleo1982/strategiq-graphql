import path from 'node:path'
import pino from 'pino'
import { build } from 'pino-roll'
import { isDev } from '@/support'
import { env } from '@/support/config'

/**
 * Configuração de rotação de logs
 */
interface LogRotationConfig {
  enabled: boolean
  directory: string
  filename: string
  frequency: 'daily' | 'hourly'
  maxFiles?: number
  maxSize?: string
}

/**
 * Configuração padrão de rotação
 */
const defaultRotationConfig: LogRotationConfig = {
  enabled: env.LOG_ROTATION_ENABLED,
  directory: env.LOG_DIR,
  filename: env.LOG_FILENAME,
  frequency: env.LOG_FREQUENCY,
  maxFiles: env.LOG_MAX_FILES,
  maxSize: env.LOG_MAX_SIZE,
}

/**
 * Cria transport com rotação de logs
 * Os logs são salvos em arquivos que rotacionam automaticamente
 */
export function createRotatingFileTransport(config: Partial<LogRotationConfig> = {}) {
  const finalConfig = { ...defaultRotationConfig, ...config }

  if (!finalConfig.enabled) {
    return null
  }

  const logPath = path.join(finalConfig.directory, finalConfig.filename)

  // Cria transport com pino-roll para rotação automática
  return build({
    file: logPath,
    frequency: finalConfig.frequency,
    size: finalConfig.maxSize,
    mkdir: true,
  })
}

/**
 * Cria múltiplos transports (console + arquivo)
 * Útil para ambientes de produção onde queremos logs tanto no console quanto em arquivo
 */
export function createMultiTransport(options: {
  console?: boolean
  file?: boolean
  rotation?: Partial<LogRotationConfig>
}) {
  const targets: pino.TransportTargetOptions[] = []

  // Transport para console (com pretty print em dev)
  if (options.console !== false) {
    if (isDev) {
      targets.push({
        target: 'pino-pretty',
        level: 'debug',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{if traceId}[{traceId}] {end}{msg}',
        },
      })
    } else {
      targets.push({
        target: 'pino/file',
        level: 'info',
        options: {
          destination: 1, // stdout
        },
      })
    }
  }

  // Transport para arquivo com rotação
  if (options.file && options.rotation?.enabled) {
    const config = { ...defaultRotationConfig, ...options.rotation }
    const logPath = path.join(config.directory, config.filename)

    targets.push({
      target: 'pino-roll',
      level: 'info',
      options: {
        file: logPath,
        frequency: config.frequency,
        size: config.maxSize,
        mkdir: true,
      },
    })
  }

  return pino.transport({
    targets,
  })
}

/**
 * Transport para serviços externos (exemplo: Datadog, LogTail, etc)
 * Pode ser estendido conforme necessidade
 */
export function createExternalServiceTransport(service: 'datadog' | 'logtail') {
  // Placeholder para integração futura
  // Implementar conforme necessidade com os SDKs específicos

  switch (service) {
    case 'datadog':
      // Exemplo: transport para Datadog
      return null
    case 'logtail':
      // Exemplo: transport para LogTail
      return null
    default:
      return null
  }
}
