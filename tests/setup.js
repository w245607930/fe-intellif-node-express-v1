import { afterAll } from 'vitest';

import { disconnectDatabase } from '../src/config/database.js';
import { disconnectQueue } from '../src/config/queue.js';
import { disconnectRedis } from '../src/config/redis.js';

afterAll(async () => {
  await Promise.allSettled([disconnectQueue(), disconnectRedis(), disconnectDatabase()]);
});
