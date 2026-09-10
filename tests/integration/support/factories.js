import crypto from 'node:crypto';

import { hashPassword } from '../../../src/modules/auth/auth.crypto.js';

const suffix = () => crypto.randomUUID().slice(0, 8);

export async function createTestUser(prisma, overrides = {}) {
  const id = suffix();
  const { password = 'StrongPassword123', ...userOverrides } = overrides;
  const user = await prisma.user.create({
    data: {
      username: `test-user-${id}`,
      email: `test-${id}@example.com`,
      passwordHash: await hashPassword(password),
      ...userOverrides,
    },
  });
  return { user, password };
}

export function createTestRole(prisma, overrides = {}) {
  const id = suffix();
  return prisma.role.create({
    data: { code: `test-role-${id}`, name: `Test role ${id}`, ...overrides },
  });
}

export function createTestPermission(prisma, overrides = {}) {
  const id = suffix();
  return prisma.permission.create({
    data: { code: `test:permission:${id}`, name: `Test permission ${id}`, ...overrides },
  });
}
