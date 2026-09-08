import { REDIS_DEFAULT_TTL_SECONDS } from '../constants/redis.js';

export function createCacheService(redis) {
  return {
    async get(key) {
      const value = await redis.get(key);
      return value === null ? null : JSON.parse(value);
    },

    async set(key, value, ttlSeconds = REDIS_DEFAULT_TTL_SECONDS) {
      if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
        throw new Error('缓存 TTL 必须为正整数秒');
      }

      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },

    async delete(key) {
      await redis.del(key);
    },

    async getOrSet(key, loader, ttlSeconds = REDIS_DEFAULT_TTL_SECONDS) {
      const cachedValue = await this.get(key);
      if (cachedValue !== null) return cachedValue;

      const value = await loader();
      await this.set(key, value, ttlSeconds);
      return value;
    },
  };
}
