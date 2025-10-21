import type { PrismaClient } from '@prisma/client'
import { prisma } from './db'

export interface Context {
  prisma: PrismaClient
}

export function createContext(): Context {
  return {
    prisma,
  }
}
