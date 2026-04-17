import { env } from '@/support/config'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, beforeEach } from 'vitest'

const TEST_DATABASE_NAME = 'strategiq_test'

const buildDatabaseUrl = (databaseName: string) => {
  const url = new URL(env.DATABASE_URL)
  url.pathname = `/${databaseName}`
  return url.toString()
}

const TEST_DATABASE_URL = buildDatabaseUrl(TEST_DATABASE_NAME)

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
  // Delete in specific order (faster than querying tables)
  // Add your tables here in the correct order
  await prisma.user.deleteMany()
}

/**
 * Cria o banco de dados de teste se não existir
 */
const ensureTestDatabase = async () => {
  const adminUrl = buildDatabaseUrl('postgres')
  const adminPrisma = new PrismaClient({
    datasources: {
      db: {
        url: adminUrl,
      },
    },
  })

  try {
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE ${TEST_DATABASE_NAME};`)
  } catch (error: any) {
    // Database already exists or other error
    if (!error.message.includes('already exists')) {
      console.warn('Warning creating test database:', error.message)
    }
  } finally {
    await adminPrisma.$disconnect()
  }
}

export const setupTestDatabase = () => {
  beforeAll(async () => {
    // Ensure test database exists
    await ensureTestDatabase()

    // Create Prisma Client (only once)
    basePrisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
      log: [], // Disable Prisma logs in tests
    })

    // Connect once
    await basePrisma.$connect()

    // Run migrations to create schema
    await basePrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

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
  })

  return {
    getContext: () => testContext,
  }
}
