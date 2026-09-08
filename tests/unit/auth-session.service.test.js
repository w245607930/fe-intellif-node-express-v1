import { describe, expect, it, vi } from 'vitest';

import { createAuthSessionService } from '../../src/modules/auth/auth-session.service.js';

describe('auth session service', () => {
  it('通过统一 Key 访问并移除会话缓存', async () => {
    const cache = {
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ userId: 'user-1' }),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const sessions = createAuthSessionService({ cache, environment: 'test' });

    await expect(sessions.get('session-1')).resolves.toEqual({ userId: 'user-1' });
    await sessions.set('session-1', { userId: 'user-1' }, 120);
    await sessions.remove('session-1');

    const key = 'fe-intellif:test:auth:session:session-1:access';
    expect(cache.get).toHaveBeenCalledWith(key);
    expect(cache.set).toHaveBeenCalledWith(key, { userId: 'user-1' }, 120);
    expect(cache.delete).toHaveBeenCalledWith(key);
  });
});
