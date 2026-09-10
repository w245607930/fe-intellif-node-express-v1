import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../src/app.js';
import { cleanTestDatabase, disconnectTestDatabase, testPrisma } from '../support/test-database.js';
import { createTestPermission, createTestRole, createTestUser } from '../support/factories.js';
describe('RBAC authorization', () => {
  beforeEach(cleanTestDatabase);
  afterAll(async () => {
    await cleanTestDatabase();
    await disconnectTestDatabase();
  });
  it('allows assigned permissions and denies after role revocation', async () => {
    const { user } = await createTestUser(testPrisma);
    const role = await createTestRole(testPrisma, { code: 'viewer', name: 'Viewer' });
    const permission = await createTestPermission(testPrisma, {
      code: 'user:list',
      name: 'List users',
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

  it('maintains role-permission bindings through protected endpoints', async () => {
    const { user: admin } = await createTestUser(testPrisma, {
      username: 'rbac-admin',
      email: 'rbac-admin@example.com',
    });
    const adminRole = await testPrisma.role.create({
      data: { code: 'admin', name: 'Administrator', isSystem: true },
    });
    await testPrisma.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
    const { user: target } = await createTestUser(testPrisma, {
      username: 'rbac-target',
      email: 'rbac-target@example.com',
    });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: admin.username, password: 'StrongPassword123' });
    const token = login.body.data.accessToken;
    const role = await createTestRole(testPrisma, { code: 'operator', name: 'Operator' });
    const permission = await createTestPermission(testPrisma, {
      code: 'user:list',
      name: 'List users',
    });
    const assign = await request(app)
      .post('/api/v1/rbac/role-permissions')
      .set('Authorization', `Bearer ${token}`)
      .send({ roleId: role.id, permissionId: permission.id });
    expect(assign.status).toBe(200);
    await request(app)
      .post('/api/v1/rbac/user-roles')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: target.id, roleId: role.id })
      .expect(200);
    const targetLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: target.username, password: 'StrongPassword123' });
    expect(
      (
        await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${targetLogin.body.data.accessToken}`)
      ).status,
    ).toBe(200);
    const revoke = await request(app)
      .delete('/api/v1/rbac/role-permissions')
      .set('Authorization', `Bearer ${token}`)
      .send({ roleId: role.id, permissionId: permission.id });
    expect(revoke.status).toBe(200);
  });
});
