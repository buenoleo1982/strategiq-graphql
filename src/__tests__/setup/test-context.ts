import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

const TEST_DATABASE_URL = 'file:./test.db';
const TEST_DB_PATH = join(process.cwd(), 'test.db');

export type TestContext = {
  prisma: PrismaClient;
};

let testContext: TestContext;

const cleanupDatabase = async (prisma: PrismaClient) => {
  // Delete all records from all tables (in correct order due to foreign keys)
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'
  `;

  for (const { name } of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`);
  }
};

export const setupTestDatabase = () => {
  beforeAll(async () => {
    // Set test database URL
    process.env.DATABASE_URL = TEST_DATABASE_URL;

    // Create Prisma Client
    testContext = {
      prisma: new PrismaClient({
        datasources: {
          db: {
            url: TEST_DATABASE_URL,
          },
        },
        log: [], // Disable Prisma logs in tests
      }),
    };

    // Push schema to test database once
    execSync('bunx prisma db push --skip-generate --force-reset', {
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
      },
      stdio: 'ignore',
    });
  });

  beforeEach(async () => {
    // Clean all data between tests
    await cleanupDatabase(testContext.prisma);
  });

  afterAll(async () => {
    // Disconnect and cleanup
    await testContext.prisma.$disconnect();

    const cleanupFiles = [
      TEST_DB_PATH,
      `${TEST_DB_PATH}-shm`,
      `${TEST_DB_PATH}-wal`,
    ];

    cleanupFiles.forEach(file => {
      if (existsSync(file)) {
        try {
          unlinkSync(file);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  });

  return {
    getContext: () => testContext,
  };
};
