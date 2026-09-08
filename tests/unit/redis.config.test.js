import { describe, expect, it } from 'vitest';

import { createRedisClient } from '../../src/config/redis.js';

describe('Redis 配置', () => {
  it('密码认证地址不会将 URL 中的用户名传给旧版 Redis', () => {
    const client = createRedisClient({
      lazyConnect: true,
      redisUrl: 'redis://:test-password@127.0.0.1:6379/0',
    });

    expect(client.options.username).toBeNull();
    expect(client.options.password).toBe('test-password');
    client.disconnect();
  });

  it('显式 ACL 用户名会传给 Redis 6 及以上版本', () => {
    const client = createRedisClient({
      lazyConnect: true,
      redisUrl: 'redis://app:test-password@127.0.0.1:6379/0',
      redisUsername: 'app',
    });

    expect(client.options.username).toBe('app');
    expect(client.options.password).toBe('test-password');
    client.disconnect();
  });
});
