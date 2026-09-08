import { getRedisClient } from '../config/redis.js';
import { createRateLimitService } from '../services/rate-limit.service.js';
import { buildRedisKey } from '../utils/redis-key.js';
import { REDIS_KEY_PREFIX, REDIS_RATE_LIMIT_WINDOW_SECONDS } from '../constants/redis.js';
import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../constants/error-codes.js';
export async function authRateLimit(req, _res, next) {
  try {
    const key = buildRedisKey({
      app: REDIS_KEY_PREFIX,
      environment: process.env.NODE_ENV ?? 'development',
      domain: 'auth',
      entity: 'rate-limit',
      identifier: req.ip.replaceAll(':', '-'),
      purpose: 'login',
    });
    const result = await createRateLimitService(getRedisClient()).consume(key, {
      limit: 10,
      windowSeconds: REDIS_RATE_LIMIT_WINDOW_SECONDS,
    });
    if (!result.allowed)
      throw new AppError({ statusCode: 429, code: ERROR_CODES.CONFLICT, message: '请求过于频繁' });
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    next();
  }
}
