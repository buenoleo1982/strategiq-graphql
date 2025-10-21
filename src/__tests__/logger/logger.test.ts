import { describe, expect, it } from 'vitest'
import { createContextLogger, createPerformanceLogger, logger } from '../../lib/logger'
import {
  logBusinessEvent,
  logDatabaseQuery,
  logError,
  logExternalCall,
} from '../../lib/logger/helpers'
import { extractOrGenerateTraceId, generateTraceId } from '../../lib/logger/trace'

describe('Logger System', () => {
  describe('Basic Logger', () => {
    it('should create logger instance', () => {
      expect(logger).toBeDefined()
      expect(logger.info).toBeDefined()
      expect(logger.error).toBeDefined()
      expect(logger.debug).toBeDefined()
    })

    it('should log without errors', () => {
      expect(() => {
        logger.info('Test log message')
        logger.debug({ test: 'data' }, 'Debug message')
        logger.error('Error message')
      }).not.toThrow()
    })
  })

  describe('Context Logger', () => {
    it('should create logger with context', () => {
      const contextLogger = createContextLogger({
        traceId: 'test-123',
        userId: 'user-456',
      })

      expect(contextLogger).toBeDefined()
      expect(() => {
        contextLogger.info('Message with context')
      }).not.toThrow()
    })
  })

  describe('Trace ID', () => {
    it('should generate valid UUID trace ID', () => {
      const traceId = generateTraceId()
      expect(traceId).toBeDefined()
      expect(typeof traceId).toBe('string')
      expect(traceId.length).toBeGreaterThan(0)
      // UUID v4 format
      expect(traceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    })

    it('should extract trace ID from headers', () => {
      const headers = new Headers()
      headers.set('x-trace-id', 'custom-trace-123')

      const traceId = extractOrGenerateTraceId(headers)
      expect(traceId).toBe('custom-trace-123')
    })

    it('should extract from different header names', () => {
      const headers1 = new Headers()
      headers1.set('x-request-id', 'request-456')
      expect(extractOrGenerateTraceId(headers1)).toBe('request-456')

      const headers2 = new Headers()
      headers2.set('x-correlation-id', 'correlation-789')
      expect(extractOrGenerateTraceId(headers2)).toBe('correlation-789')
    })

    it('should generate trace ID if not in headers', () => {
      const headers = new Headers()
      const traceId = extractOrGenerateTraceId(headers)

      expect(traceId).toBeDefined()
      expect(traceId.length).toBeGreaterThan(0)
      expect(traceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    })
  })

  describe('Performance Logger', () => {
    it('should measure execution time', async () => {
      const perfLogger = createPerformanceLogger('test-operation')

      // Simula operação
      await new Promise(resolve => setTimeout(resolve, 10))

      const duration = perfLogger.end({ result: 'success' })
      expect(duration).toBeGreaterThanOrEqual(8) // Permite variação de timing
    })

    it('should log errors with duration', async () => {
      const perfLogger = createPerformanceLogger('failing-operation')

      await new Promise(resolve => setTimeout(resolve, 10))

      const error = new Error('Test error')
      const duration = perfLogger.error(error)
      expect(duration).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Helper Functions', () => {
    it('should log database query success', () => {
      expect(() => {
        const dbLog = logDatabaseQuery('SELECT', 'users', { id: '123' })
        dbLog.success({ count: 1 })
      }).not.toThrow()
    })

    it('should log database query error', () => {
      expect(() => {
        const dbLog = logDatabaseQuery('INSERT', 'users', { name: 'Test' })
        dbLog.error(new Error('DB error'))
      }).not.toThrow()
    })

    it('should log external call success', () => {
      expect(() => {
        const apiLog = logExternalCall('GitHub', '/api/users', 'GET')
        apiLog.success(200, { data: 'test' })
      }).not.toThrow()
    })

    it('should log external call error', () => {
      expect(() => {
        const apiLog = logExternalCall('GitHub', '/api/users', 'GET')
        apiLog.error(new Error('API error'), 500)
      }).not.toThrow()
    })

    it('should log business event', () => {
      expect(() => {
        logBusinessEvent('user.created', { userId: '123', email: 'test@example.com' })
      }).not.toThrow()
    })

    it('should log error with context', () => {
      expect(() => {
        const error = new Error('Test error')
        logError(error, {
          traceId: 'test-123',
          userId: 'user-456',
          operation: 'test-operation',
        })
      }).not.toThrow()
    })
  })
})
