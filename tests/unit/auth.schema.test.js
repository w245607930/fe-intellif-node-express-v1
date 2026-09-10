import { describe, expect, it } from 'vitest';

import {
  credentialsSchema,
  loginSchema,
  refreshSchema,
} from '../../src/modules/auth/auth.schema.js';

describe('authentication input schemas', () => {
  it('accepts a strong registration password and normal login payload', () => {
    expect(
      credentialsSchema.parse({
        username: 'test-user',
        email: 'test@example.com',
        password: 'StrongPassword123',
      }),
    ).toMatchObject({ username: 'test-user', email: 'test@example.com' });
    expect(loginSchema.parse({ identifier: 'test-user', password: 'password' })).toEqual({
      identifier: 'test-user',
      password: 'password',
    });
  });

  it.each(['short', 'alllowercase123', 'ALLUPPERCASE123', 'NoDigitsHere'])(
    'rejects a password without the required policy: %s',
    (password) => {
      expect(() =>
        credentialsSchema.parse({ username: 'test-user', email: 'test@example.com', password }),
      ).toThrow();
    },
  );

  it('requires a non-trivial refresh token', () => {
    expect(() => refreshSchema.parse({ refreshToken: 'too-short' })).toThrow();
    expect(refreshSchema.parse({ refreshToken: 'a'.repeat(48) })).toEqual({
      refreshToken: 'a'.repeat(48),
    });
  });
});
