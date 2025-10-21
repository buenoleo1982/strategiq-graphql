import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, beforeEach } from 'vitest'

const TEST_DATABASE_URL = 'postgresql://strategiq:strategiq@localhost:5432/strategiq_test'

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
  const adminUrl = TEST_DATABASE_URL.replace('/strategiq_test', '/postgres')
  const adminPrisma = new PrismaClient({
    datasources: {
      db: {
        url: adminUrl,
      },
    },
  })

  try {
    await adminPrisma.$executeRawUnsafe('CREATE DATABASE strategiq_test;')
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

    // Set test database URL
    process.env.DATABASE_URL = TEST_DATABASE_URL

    // Create Prisma Client (only once)
    basePrisma = new PrismaClient({
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
