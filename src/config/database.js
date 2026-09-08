import { PrismaClient } from '@prisma/client';

const globalDatabase = globalThis;

export const prisma =
  globalDatabase.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (process.env.NODE_ENV !== 'production') {
  globalDatabase.__prisma = prisma;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}
