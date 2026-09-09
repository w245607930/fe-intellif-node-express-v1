import { describe, expect, it } from 'vitest';
import { assertPermissionCode } from '../../src/middlewares/permission.js';

describe('permission code', () => {
  it('accepts resource:action identifiers', () => {
    expect(() => assertPermissionCode('user:list')).not.toThrow();
  });
  it('rejects malformed permission identifiers', () => {
    expect(() => assertPermissionCode('User List')).toThrow();
  });
});
