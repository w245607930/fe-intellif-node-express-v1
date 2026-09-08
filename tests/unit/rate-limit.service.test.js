import { describe, expect, it, vi } from 'vitest';

import { createRateLimitService } from '../../src/services/rate-limit.service.js';

describe('rate limit service', () => {
  it('使用原子递增结果计算限流状态和剩余次数', async () => {
    const redis = {
      eval: vi.fn().mockResolvedValue(4),
      ttl: vi.fn().mockResolvedValue(53),
    };
    const rateLimit = createRateLimitService(redis);

    await expect(
      rateLimit.consume('fe-intellif:test:auth:login:user-1', { limit: 3, windowSeconds: 60 }),
    ).resolves.toEqual({
      allowed: false,
      count: 4,
      remaining: 0,
      retryAfterSeconds: 53,
    });
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'fe-intellif:test:auth:login:user-1',
      60,
    );
  });
});
