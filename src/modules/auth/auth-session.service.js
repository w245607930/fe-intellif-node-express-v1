import { REDIS_DEFAULT_TTL_SECONDS, REDIS_KEY_PREFIX } from '../../constants/redis.js';
import { buildRedisKey } from '../../utils/redis-key.js';

export function createAuthSessionService({ cache, environment }) {
  return {
    async get(sessionId) {
      return cache.get(
        buildRedisKey({
          app: REDIS_KEY_PREFIX,
          environment,
          domain: 'auth',
          entity: 'session',
          identifier: sessionId,
          purpose: 'access',
        }),
      );
    },

    async set(sessionId, session, ttlSeconds = REDIS_DEFAULT_TTL_SECONDS) {
      await cache.set(
        buildRedisKey({
          app: REDIS_KEY_PREFIX,
          environment,
          domain: 'auth',
          entity: 'session',
          identifier: sessionId,
          purpose: 'access',
        }),
        session,
        ttlSeconds,
      );
    },

    async remove(sessionId) {
      await cache.delete(
        buildRedisKey({
          app: REDIS_KEY_PREFIX,
          environment,
          domain: 'auth',
          entity: 'session',
          identifier: sessionId,
          purpose: 'access',
        }),
      );
    },
  };
}
