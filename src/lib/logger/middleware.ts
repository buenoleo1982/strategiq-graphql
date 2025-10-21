import type { Server } from 'bun'
import { createContextLogger } from './index'
import { extractOrGenerateTraceId } from './trace'

/**
 * Informações de logging da requisição
 */
interface RequestLogInfo {
  traceId: string
  method: string
  url: string
  userAgent?: string
  ip?: string
}

/**
 * Informações de logging da resposta
 */
interface ResponseLogInfo extends RequestLogInfo {
  statusCode: number
  duration: number
}

type FetchFunction = (request: Request, server: Server<any>) => Response | Promise<Response>

/**
 * Cria um wrapper de fetch com logging automático
 * Injeta trace ID e loga início/fim de cada requisição
 */
export function createLoggingFetch(originalFetch: FetchFunction): FetchFunction {
  return async (request: Request, server: Server<any>) => {
    const startTime = Date.now()

    // Extrai ou gera trace ID
    const traceId = extractOrGenerateTraceId(request.headers)

    // Cria logger com contexto da requisição
    const reqLogger = createContextLogger({ traceId })

    // Extrai informações da requisição
    const requestInfo: RequestLogInfo = {
      traceId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: server.requestIP(request)?.address || undefined,
    }

    // Log de início da requisição
    reqLogger.info(
      {
        req: requestInfo,
        type: 'request',
      },
      `${request.method} ${new URL(request.url).pathname}`
    )

    let response: Response
    let error: Error | undefined

    try {
      // Clona request para adicionar trace ID nos headers
      const requestWithTrace = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'x-trace-id': traceId,
        },
      })

      // Executa o handler original
      response = await originalFetch(requestWithTrace, server)
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))

      // Log de erro
      reqLogger.error(
        {
          req: requestInfo,
          error,
          type: 'error',
        },
        `Request failed: ${error.message}`
      )

      // Cria resposta de erro
      response = new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          traceId,
        }),
        {
          status: 500,
          headers: {
            'content-type': 'application/json',
            'x-trace-id': traceId,
          },
        }
      )
    }

    const duration = Date.now() - startTime

    // Adiciona trace ID no response header
    const headers = new Headers(response.headers)
    headers.set('x-trace-id', traceId)

    const responseWithTrace = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })

    // Informações da resposta (mantido para possível uso futuro)
    const _responseInfo: ResponseLogInfo = {
      ...requestInfo,
      statusCode: response.status,
      duration,
    }

    // Log de fim da requisição
    const logLevel = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info'

    reqLogger[logLevel](
      {
        req: requestInfo,
        res: {
          statusCode: response.status,
        },
        duration,
        type: 'response',
      },
      `${request.method} ${new URL(request.url).pathname} ${response.status} - ${duration}ms`
    )

    return responseWithTrace
  }
}

/**
 * Plugin para adicionar logging no contexto do GraphQL Yoga
 */
export function createGraphQLLoggingPlugin() {
  return {
    onRequest({ request }: any) {
      const traceId = extractOrGenerateTraceId(request.headers)
      const reqLogger = createContextLogger({ traceId })

      reqLogger.debug(
        {
          traceId,
          type: 'graphql-request',
        },
        'GraphQL request received'
      )
    },
  }
}
