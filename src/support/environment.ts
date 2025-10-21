import { env } from "@/support/config";

export const isProduction = env.NODE_ENV === 'production'
export const isTesting = env.NODE_ENV === 'test'
export const isDev = env.NODE_ENV === 'development'