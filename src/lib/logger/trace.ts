import { randomUUID } from 'node:crypto'

/**
 * Gera um ID único para rastreamento de requisições
 * Usa UUID v4 para garantir unicidade
 */
export function generateTraceId(): string {
  return randomUUID()
}

/**
 * Extrai trace ID do header da requisição ou gera um novo
 * Suporta headers padrão: X-Trace-Id, X-Request-Id, X-Correlation-Id
 */
export function extractOrGenerateTraceId(headers: Headers): string {
  // Tenta extrair de headers comuns
  const traceId =
    headers.get('x-trace-id') || headers.get('x-request-id') || headers.get('x-correlation-id')

  // Se encontrou, usa; senão gera um novo
  return traceId || generateTraceId()
}

/**
 * Storage assíncrono para trace context
 * Permite acesso ao trace ID em qualquer lugar da aplicação
 */
class TraceContextStorage {
  private store = new Map<string, string>()

  set(key: string, traceId: string): void {
    this.store.set(key, traceId)
  }

  get(key: string): string | undefined {
    return this.store.get(key)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

export const traceStorage = new TraceContextStorage()
