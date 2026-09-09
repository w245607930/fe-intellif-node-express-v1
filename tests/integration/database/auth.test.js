import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../src/app.js';
import { cleanTestDatabase, disconnectTestDatabase, testPrisma } from '../support/test-database.js';

const credentials = {
  username: 'auth-user',
  email: 'auth-user@example.com',
  password: 'StrongPassword123',
};

beforeEach(cleanTestDatabase);
afterAll(async () => {
  await cleanTestDatabase();
  await disconnectTestDatabase();
});

describe('authentication flow', () => {
  it('registers, logs in, reads current user, rotates and revokes refresh tokens', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send(credentials);
    expect(registered.status).toBe(201);

    const failed = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: credentials.username, password: 'WrongPassword123' });
    expect(failed.status).toBe(401);

    const loggedIn = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: credentials.username, password: credentials.password });
    expect(loggedIn.status).toBe(200);
    const { accessToken, refreshToken } = loggedIn.body.data;

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.username).toBe(credentials.username);

    const rotated = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(rotated.status).toBe(200);
    expect(rotated.body.data.refreshToken).not.toBe(refreshToken);

    const replay = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(replay.status).toBe(401);
    await expect(testPrisma.refreshSession.count({ where: { status: 'ACTIVE' } })).resolves.toBe(0);
  });
});
