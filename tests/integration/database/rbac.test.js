import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../src/app.js';
import { hashPassword } from '../../../src/modules/auth/auth.crypto.js';
import { cleanTestDatabase, disconnectTestDatabase, testPrisma } from '../support/test-database.js';
describe('RBAC authorization', () => {
  beforeEach(cleanTestDatabase);
  afterAll(async () => {
    await cleanTestDatabase();
    await disconnectTestDatabase();
  });
  it('allows assigned permissions and denies after role revocation', async () => {
    const user = await testPrisma.user.create({
      data: {
        username: 'rbac-user',
        email: 'rbac@example.com',
        passwordHash: await hashPassword('StrongPassword123'),
      },
    });
    const role = await testPrisma.role.create({ data: { code: 'viewer', name: 'Viewer' } });
    const permission = await testPrisma.permission.create({
      data: { code: 'user:list', name: 'List users' },
    });
    await testPrisma.rolePermission.create({
      data: { roleId: role.id, permissionId: permission.id },
    });
    await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: user.username, password: 'StrongPassword123' });
    const token = login.body.data.accessToken;
    expect(
      (await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`)).status,
    ).toBe(200);
    await testPrisma.userRole.delete({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
    });
    expect(
      (await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`)).status,
    ).toBe(403);
  });
});
