import { PrismaClient } from '@prisma/client'

import { isProduction } from '@/support/environment'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (isProduction) globalThis.prismaGlobal = prisma
