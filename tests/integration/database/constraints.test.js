import { Prisma } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanTestDatabase, disconnectTestDatabase, testPrisma } from '../support/test-database.js';

const userData = {
  username: 'constraint-user',
  email: 'constraint@example.com',
  passwordHash: 'test-only-password-hash',
};

function expectUniqueConstraint(operation) {
  return expect(operation).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
}

beforeEach(cleanTestDatabase);
afterAll(async () => {
  await cleanTestDatabase();
  await disconnectTestDatabase();
});

describe('数据库唯一约束', () => {
  it('拒绝重复用户名和邮箱', async () => {
    await testPrisma.user.create({ data: userData });

    await expectUniqueConstraint(
      testPrisma.user.create({
        data: { ...userData, email: 'another@example.com' },
      }),
    );
    await expectUniqueConstraint(
      testPrisma.user.create({
        data: { ...userData, username: 'another-user' },
      }),
    );
  });

  it('拒绝重复角色、权限和关联', async () => {
    const user = await testPrisma.user.create({ data: userData });
    const role = await testPrisma.role.create({ data: { code: 'tester', name: '测试角色' } });
    const permission = await testPrisma.permission.create({
      data: { code: 'test:read', name: '测试读取' },
    });

    await expectUniqueConstraint(
      testPrisma.role.create({ data: { code: role.code, name: '重复角色' } }),
    );
    await expectUniqueConstraint(
      testPrisma.permission.create({ data: { code: permission.code, name: '重复权限' } }),
    );

    await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    await testPrisma.rolePermission.create({
      data: { roleId: role.id, permissionId: permission.id },
    });

    await expectUniqueConstraint(
      testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } }),
    );
    await expectUniqueConstraint(
      testPrisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permission.id },
      }),
    );
  });
});

describe('数据库关联删除', () => {
  it('删除用户时级联删除角色关联和刷新会话', async () => {
    const user = await testPrisma.user.create({ data: userData });
    const role = await testPrisma.role.create({ data: { code: 'member', name: '成员' } });
    await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    await testPrisma.refreshSession.create({
      data: {
        userId: user.id,
        familyId: 'test-family',
        tokenHash: 'a'.repeat(64),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await testPrisma.user.delete({ where: { id: user.id } });

    await expect(testPrisma.userRole.count()).resolves.toBe(0);
    await expect(testPrisma.refreshSession.count()).resolves.toBe(0);
  });

  it('删除角色或权限时级联删除 RBAC 关联', async () => {
    const user = await testPrisma.user.create({ data: userData });
    const role = await testPrisma.role.create({ data: { code: 'auditor', name: '审计员' } });
    const permission = await testPrisma.permission.create({
      data: { code: 'audit:read', name: '读取审计' },
    });
    await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    await testPrisma.rolePermission.create({
      data: { roleId: role.id, permissionId: permission.id },
    });

    await testPrisma.permission.delete({ where: { id: permission.id } });
    await expect(testPrisma.rolePermission.count()).resolves.toBe(0);

    await testPrisma.role.delete({ where: { id: role.id } });
    await expect(testPrisma.userRole.count()).resolves.toBe(0);
  });

  it('删除被替换会话时将轮换引用设置为空', async () => {
    const user = await testPrisma.user.create({ data: userData });
    const replacement = await testPrisma.refreshSession.create({
      data: {
        userId: user.id,
        familyId: 'rotation-family',
        tokenHash: 'b'.repeat(64),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const original = await testPrisma.refreshSession.create({
      data: {
        userId: user.id,
        familyId: 'rotation-family',
        tokenHash: 'c'.repeat(64),
        expiresAt: new Date(Date.now() + 60_000),
        replacedById: replacement.id,
      },
    });

    await testPrisma.refreshSession.delete({ where: { id: replacement.id } });

    await expect(
      testPrisma.refreshSession.findUnique({ where: { id: original.id } }),
    ).resolves.toMatchObject({ replacedById: null });
  });
});
