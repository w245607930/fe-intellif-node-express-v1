import Redis from 'ioredis';
import { Queue } from 'bullmq';

import { getRedisConnectionOptions } from './redis.js';
import { env } from './env.js';
import { REDIS_KEY_PREFIX } from '../constants/redis.js';
import { QUEUE_DEFAULTS, QUEUE_NAMES } from '../constants/queue.js';

let queueConnection;
let systemQueue;

function createQueueConnection() {
  if (!env.REDIS_URL) throw new Error('REDIS_URL is required for queues');
  const { connectionUrl, password, username } = getRedisConnectionOptions(
    env.REDIS_URL,
    env.REDIS_USERNAME,
  );
  return new Redis(connectionUrl, {
    ...(password ? { password } : {}),
    ...(username ? { username } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export function getQueueConnection() {
  queueConnection ??= createQueueConnection();
  return queueConnection;
}

export function getSystemQueue() {
  systemQueue ??= new Queue(QUEUE_NAMES.SYSTEM, {
    connection: getQueueConnection(),
    prefix: `${REDIS_KEY_PREFIX}:${env.NODE_ENV}:queue:bullmq`,
    defaultJobOptions: QUEUE_DEFAULTS,
  });
  return systemQueue;
}

export async function disconnectQueue() {
  await systemQueue?.close();
  systemQueue = undefined;
  if (queueConnection) await queueConnection.quit();
  queueConnection = undefined;
}
