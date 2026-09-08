import 'dotenv/config';
import { promisify } from 'node:util';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/config/logger.js';

const scrypt = promisify(scryptCallback);
const prisma = new PrismaClient();

const permissions = [
  ['user:list', '查看用户'],
  ['user:create', '创建用户'],
  ['user:update', '更新用户'],
  ['role:list', '查看角色'],
  ['role:update', '更新角色'],
];

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD 必须配置且至少包含 12 个字符');
  }

  const permissionRecords = await Promise.all(
    permissions.map(([code, name]) =>
      prisma.permission.upsert({
        where: { code },
        update: { name },
        create: { code, name },
      }),
    ),
  );

  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '系统管理员', isSystem: true },
    create: { code: 'admin', name: '系统管理员', isSystem: true },
  });

  await Promise.all(
    permissionRecords.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: adminRole.id, permissionId: permission.id },
      }),
    ),
  );

  const existingAdmin = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true },
  });

  const admin =
    existingAdmin ??
    (await prisma.user.create({
      data: { username, email, passwordHash: await hashPassword(password) },
      select: { id: true },
    }));

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });
}

main()
  .then(() => logger.info('数据库种子初始化完成'))
  .catch((error) => {
    logger.error({ err: error }, '数据库种子初始化失败');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
