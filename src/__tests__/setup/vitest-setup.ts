import { afterAll, beforeAll } from 'vitest'

// Store original console methods
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Suppress console errors and warnings during tests
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Only suppress GraphQL and Prisma error logs
    const message = args[0]?.toString() || ''
    if (
      message.includes('GraphQLError') ||
      message.includes('PrismaClientKnownRequestError') ||
      message.includes('Invalid `prisma.')
    ) {
      return
    }
    originalConsoleError(...args)
  }

  console.warn = (..._args: any[]) => {
    // Suppress warnings during tests
    return
  }
})

// Restore console methods after tests
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})
