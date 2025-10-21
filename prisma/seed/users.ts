import { PasswordService } from '@/lib/auth/password'
import type { PrismaClient } from '@prisma/client'

const basePassword = '1234567890x1'
const adminEmail = 'demo@demo.com'
const moderatorEmail = 'mod@demo.com'

export async function seedUsers(prisma: PrismaClient) {
  const password = await PasswordService.hash(basePassword)

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        email: adminEmail,
        password,
      },
      {
        email: moderatorEmail,
        name: 'Moderator',
        password,
      },
    ],
  })

  return await prisma.user.findMany()
}
