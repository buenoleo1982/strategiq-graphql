import { PrismaClient } from '@prisma/client'
import { seedUsers } from './users'

const prisma = new PrismaClient()

Bun.write(Bun.stdout, '🗑️  Cleaning up the database...\n')
await prisma.user.deleteMany()

Bun.write(Bun.stdout, '🌱 Starting seeding...\n')
await seedUsers(prisma)

Bun.write(Bun.stdout, '✅ Seeding completed!\n')

await prisma.$disconnect()
