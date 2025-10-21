import { prisma } from './db';
import type { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

export function createContext(): Context {
  return {
    prisma,
  };
}
