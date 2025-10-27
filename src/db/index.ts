import { Prisma, PrismaClient } from '@prisma/client'
import type { DefaultArgs } from '@prisma/client/runtime/library'

import { isProduction } from '@/support/environment'

type T = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

const prismaClientSingleton = (): T => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (isProduction) globalThis.prismaGlobal = prisma
