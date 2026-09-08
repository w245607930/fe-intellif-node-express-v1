import { PrismaClient } from '@prisma/client';
import { assertSafeTestDatabase } from '../../../src/utils/database-url.js';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
assertSafeTestDatabase(testDatabaseUrl, process.env.NODE_ENV);

export const testPrisma = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
});

export async function cleanTestDatabase() {
  assertSafeTestDatabase(testDatabaseUrl, process.env.NODE_ENV);

  await testPrisma.$transaction([
    testPrisma.rolePermission.deleteMany(),
    testPrisma.userRole.deleteMany(),
    testPrisma.refreshSession.deleteMany(),
    testPrisma.permission.deleteMany(),
    testPrisma.role.deleteMany(),
    testPrisma.user.deleteMany(),
  ]);
}

export async function disconnectTestDatabase() {
  await testPrisma.$disconnect();
}
