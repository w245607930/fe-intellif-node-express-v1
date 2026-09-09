import { describe, expect, it, vi } from 'vitest';

import { checkReadiness } from '../../src/modules/health/health.service.js';

describe('health service', () => {
  it('checks database and Redis without exposing dependency details', async () => {
    const database = vi.fn().mockResolvedValue(undefined);
    const redis = vi.fn().mockResolvedValue(undefined);
    await expect(checkReadiness({ database, redis })).resolves.toEqual({ status: 'ready' });
    expect(database).toHaveBeenCalledOnce();
    expect(redis).toHaveBeenCalledOnce();
  });
});
