import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  LOG_ROTATION_ENABLED: z.coerce.boolean().default(true),
  LOG_DIR: z.string().default('./logs'),
  LOG_FILENAME: z.string().default('app.log'),
  LOG_FREQUENCY: z.enum(['daily', 'hourly']).default('daily'),
  LOG_MAX_FILES: z.coerce.number().default(7),
  LOG_MAX_SIZE: z.string().default('10M'),
});

export const env = envSchema.parse(Bun.env);
