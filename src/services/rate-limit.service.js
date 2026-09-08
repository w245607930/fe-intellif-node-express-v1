const INCREMENT_WITH_TTL = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
`;

export function createRateLimitService(redis) {
  return {
    async consume(key, { limit, windowSeconds }) {
      if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error('限流阈值必须为正整数');
      }
      if (!Number.isInteger(windowSeconds) || windowSeconds <= 0) {
        throw new Error('限流窗口必须为正整数秒');
      }

      const count = Number(await redis.eval(INCREMENT_WITH_TTL, 1, key, windowSeconds));
      const ttlSeconds = await redis.ttl(key);
      return {
        allowed: count <= limit,
        count,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: Math.max(0, ttlSeconds),
      };
    },
  };
}
