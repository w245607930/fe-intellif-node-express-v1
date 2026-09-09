import { checkDatabaseConnection } from '../../config/database.js';
import { checkRedisConnection } from '../../config/redis.js';

export async function checkReadiness({
  database = checkDatabaseConnection,
  redis = checkRedisConnection,
} = {}) {
  await Promise.all([database(), redis()]);
  return { status: 'ready' };
}
