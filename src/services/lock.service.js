import crypto from 'node:crypto';

import { REDIS_LOCK_TTL_SECONDS } from '../constants/redis.js';

const RELEASE_LOCK = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export function createLockService(redis) {
  return {
    async acquire(key, ttlSeconds = REDIS_LOCK_TTL_SECONDS) {
      if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
        throw new Error('锁 TTL 必须为正整数秒');
      }

      const token = crypto.randomUUID();
      const result = await redis.set(key, token, 'EX', ttlSeconds, 'NX');
      return result === 'OK' ? token : null;
    },

    async release(key, token) {
      if (!token) return false;
      return (await redis.eval(RELEASE_LOCK, 1, key, token)) === 1;
    },
  };
}
