import { PasswordService } from '@/lib/auth/password'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL é obrigatório para preparar o ambiente E2E.')
}

const buildAdminUrl = () => {
  const url = new URL(databaseUrl)
  url.pathname = '/postgres'
  return url.toString()
}

const getDatabaseName = () => {
  const url = new URL(databaseUrl)
  return url.pathname.replace(/^\//, '')
}

const ensureDatabase = async () => {
  const adminPrisma = new PrismaClient({
    datasources: {
      db: {
        url: buildAdminUrl(),
      },
    },
  })

  const databaseName = getDatabaseName()

  try {
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE ${databaseName};`)
  } catch (error: any) {
    if (!String(error?.message || '').includes('already exists')) {
      throw error
    }
  } finally {
    await adminPrisma.$disconnect()
  }
}

const syncSchema = () => {
  const cwd = fileURLToPath(new URL('../..', import.meta.url))
  const result = Bun.spawnSync(['bunx', 'prisma', 'db', 'push', '--skip-generate', '--accept-data-loss'], {
    cwd,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdout: 'inherit',
    stderr: 'inherit',
  })

  if (result.exitCode !== 0) {
    throw new Error('Falha ao sincronizar o schema Prisma para E2E.')
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

const seedUsers = async () => {
  const password = await PasswordService.hash('1234567890x1')

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        email: 'demo@demo.com',
        password,
        role: 'ADMIN',
      },
      {
        name: 'Moderator',
        email: 'mod@demo.com',
        password,
        role: 'MANAGER',
      },
    ],
  })
}

try {
  Bun.write(Bun.stdout, '🧪 Preparing isolated E2E database...\n')
  await ensureDatabase()
  syncSchema()

  await prisma.effectivenessCheck.deleteMany()
  await prisma.evidence.deleteMany()
  await prisma.correctiveAction.deleteMany()
  await prisma.nonConformity.deleteMany()
  await prisma.indicatorEntry.deleteMany()
  await prisma.indicator.deleteMany()
  await prisma.initiative.deleteMany()
  await prisma.strategicObjective.deleteMany()
  await prisma.user.deleteMany()

  await seedUsers()
  Bun.write(Bun.stdout, `✅ E2E database ready at ${getDatabaseName()}.\n`)
} catch (error) {
  console.error('❌ E2E database setup failed.')
  console.error(error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
