import { describe, expect, it } from 'vitest';
import {
  createRefreshToken,
  hashPassword,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
  verifyPassword,
} from '../../src/modules/auth/auth.crypto.js';
describe('auth crypto', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false);
  });
  it('creates one-way refresh hashes and signed access tokens', () => {
    const refresh = createRefreshToken();
    expect(hashRefreshToken(refresh)).toHaveLength(64);
    const token = signAccessToken({ id: 'user-1', tokenVersion: 0 });
    expect(verifyAccessToken(token)).toMatchObject({ sub: 'user-1', tv: 0 });
  });
});
