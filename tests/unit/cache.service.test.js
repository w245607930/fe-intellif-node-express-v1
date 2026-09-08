import { describe, expect, it, vi } from 'vitest';

import { createCacheService } from '../../src/services/cache.service.js';

function createRedisStub() {
  return {
    del: vi.fn().mockResolvedValue(1),
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
  };
}

describe('cache service', () => {
  it('缓存未命中时加载、序列化并设置 TTL', async () => {
    const redis = createRedisStub();
    redis.get.mockResolvedValue(null);
    const cache = createCacheService(redis);
    const loader = vi.fn().mockResolvedValue({ userId: 'user-1' });

    await expect(
      cache.getOrSet('fe-intellif:test:cache:user:user-1', loader, 120),
    ).resolves.toEqual({
      userId: 'user-1',
    });
    expect(loader).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledWith(
      'fe-intellif:test:cache:user:user-1',
      '{"userId":"user-1"}',
      'EX',
      120,
    );
  });

  it('缓存命中时不调用加载器', async () => {
    const redis = createRedisStub();
    redis.get.mockResolvedValue('{"userId":"user-1"}');
    const cache = createCacheService(redis);
    const loader = vi.fn();

    await expect(cache.getOrSet('fe-intellif:test:cache:user:user-1', loader)).resolves.toEqual({
      userId: 'user-1',
    });
    expect(loader).not.toHaveBeenCalled();
  });

  it('拒绝无 TTL 的缓存写入', async () => {
    const cache = createCacheService(createRedisStub());

    await expect(
      cache.set('fe-intellif:test:cache:user:user-1', { id: 'user-1' }, 0),
    ).rejects.toThrow('缓存 TTL 必须为正整数秒');
  });
});
