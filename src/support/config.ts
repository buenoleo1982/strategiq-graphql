import { z } from 'zod'

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform(value => {
    if (typeof value === 'boolean') return value

    const normalized = value.trim().toLowerCase()

    if (['true', '1', 'yes', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'off'].includes(normalized)) return false

    throw new Error(`Valor booleano inválido: ${value}`)
  })

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgresql://'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_ROTATION_ENABLED: booleanFromEnv.default(true),
  LOG_DIR: z.string().default('./logs'),
  LOG_FILENAME: z.string().default('app.log'),
  LOG_FREQUENCY: z.enum(['daily', 'hourly']).default('daily'),
  LOG_MAX_FILES: z.coerce.number().default(7),
  LOG_MAX_SIZE: z.string().default('10M'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório').default('strategiq-dev-secret'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_HOST: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_CONSOLE_PORT: z.coerce.number().default(9001),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_USE_SSL: booleanFromEnv.default(false),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY é obrigatório').default('strategiq'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY é obrigatório').default('strategiq123'),
  MINIO_BUCKET_NAME: z.string().min(1, 'MINIO_BUCKET_NAME é obrigatório').default('evidences'),
})

export const env = envSchema.parse(process.env)
