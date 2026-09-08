import { describe, expect, it, vi } from 'vitest';

import { createLockService } from '../../src/services/lock.service.js';

describe('lock service', () => {
  it('加锁成功时返回唯一持有者值', async () => {
    const redis = {
      eval: vi.fn(),
      set: vi.fn().mockResolvedValue('OK'),
    };
    const lock = createLockService(redis);

    const token = await lock.acquire('fe-intellif:test:lock:job:daily');

    expect(token).toEqual(expect.any(String));
    expect(redis.set).toHaveBeenCalledWith(
      'fe-intellif:test:lock:job:daily',
      token,
      'EX',
      30,
      'NX',
    );
  });

  it('仅当持有者值匹配时释放锁', async () => {
    const redis = {
      eval: vi.fn().mockResolvedValue(0),
      set: vi.fn(),
    };
    const lock = createLockService(redis);

    await expect(lock.release('fe-intellif:test:lock:job:daily', 'not-owner')).resolves.toBe(false);
    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('GET'"),
      1,
      'fe-intellif:test:lock:job:daily',
      'not-owner',
    );
  });
});
