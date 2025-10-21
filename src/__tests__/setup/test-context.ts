import { execSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, beforeEach } from 'vitest'

const TEST_DATABASE_URL = 'file:./test.db'
const TEST_DB_PATH = join(process.cwd(), 'test.db')

export type TestContext = {
  prisma: PrismaClient
}

let testContext: TestContext
let basePrisma: PrismaClient

/**
 * Limpeza otimizada usando TRUNCATE ou DELETE direto
 * Muito mais rápido que query dinâmica
 */
const cleanupDatabase = async (prisma: PrismaClient) => {
  // Disable foreign keys temporarily for faster cleanup
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF')

  // Delete in specific order (faster than querying tables)
  // Add your tables here in the correct order
  await prisma.user.deleteMany()

  // Re-enable foreign keys
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON')
}

export const setupTestDatabase = () => {
  beforeAll(async () => {
    // Set test database URL
    process.env.DATABASE_URL = TEST_DATABASE_URL

    // Create Prisma Client (only once)
    basePrisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
      log: [], // Disable Prisma logs in tests
    })

    // Push schema to test database once (only if DB doesn't exist)
    if (!existsSync(TEST_DB_PATH)) {
      execSync('bunx prisma db push --skip-generate --force-reset', {
        env: {
          ...process.env,
          DATABASE_URL: TEST_DATABASE_URL,
        },
        stdio: 'ignore',
      })
    }

    // Connect once
    await basePrisma.$connect()

    // Initial context (will be reset per test)
    testContext = {
      prisma: basePrisma,
    }
  })

  beforeEach(async () => {
    // Fast cleanup between tests (only delete data, keep schema)
    await cleanupDatabase(basePrisma)
  })

  afterAll(async () => {
    // Disconnect once
    await basePrisma.$disconnect()

    // Cleanup database files after all tests
    const cleanupFiles = [TEST_DB_PATH, `${TEST_DB_PATH}-shm`, `${TEST_DB_PATH}-wal`]

    cleanupFiles.forEach(file => {
      if (existsSync(file)) {
        try {
          unlinkSync(file)
        } catch (_error) {
          // Ignore cleanup errors
        }
      }
    })
  })

  return {
    getContext: () => testContext,
  }
}
