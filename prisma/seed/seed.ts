import { PrismaClient } from '@prisma/client'
import { seedIndicatorEntries } from './indicator-entries'
import { seedIndicators } from './indicators'
import { seedNonConformities } from './non-conformities'
import { seedStrategicObjectives } from './strategic-objectives'
import { seedUsers } from './users'

const prisma = new PrismaClient()

try {
  Bun.write(Bun.stdout, '🗑️  Cleaning up the database...\n')
  await prisma.nonConformity.deleteMany()
  await prisma.indicatorEntry.deleteMany()
  await prisma.indicator.deleteMany()
  await prisma.strategicObjective.deleteMany()
  await prisma.user.deleteMany()

  Bun.write(Bun.stdout, '🌱 Starting seeding...\n')
  const users = await seedUsers(prisma)
  const objectives = await seedStrategicObjectives(prisma)
  const indicators = await seedIndicators(prisma)
  const indicatorEntries = await seedIndicatorEntries(prisma)
  const nonConformities = await seedNonConformities(prisma)

  Bun.write(
    Bun.stdout,
    `✅ Seeding completed! ${users.length} users, ${objectives.length} strategic objectives, ${indicators.length} indicators, ${indicatorEntries.length} entries and ${nonConformities.length} non-conformities available.\n`
  )
} catch (error) {
  console.error('❌ Seed failed.')
  console.error(error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
