import Redis from 'ioredis';

import { env } from './env.js';
import { logger } from './logger.js';

let redisClient;

export function getRedisConnectionOptions(redisUrl, redisUsername) {
  const url = new URL(redisUrl);
  const password = decodeURIComponent(url.password);

  url.username = '';
  url.password = '';

  return {
    connectionUrl: url.toString(),
    ...(password ? { password } : {}),
    ...(redisUsername ? { username: redisUsername } : {}),
  };
}

export function createRedisClient({
  redisUrl = env.REDIS_URL,
  redisUsername = env.REDIS_USERNAME,
  lazyConnect = true,
} = {}) {
  if (!redisUrl) {
    throw new Error('Redis 地址未配置');
  }

  const { connectionUrl, password, username } = getRedisConnectionOptions(redisUrl, redisUsername);
  const client = new Redis(connectionUrl, {
    enableOfflineQueue: false,
    lazyConnect,
    maxRetriesPerRequest: 1,
    ...(password ? { password } : {}),
    ...(username ? { username } : {}),
    retryStrategy(retryCount) {
      if (retryCount > 3) return null;
      return Math.min(retryCount * 200, 1_000);
    },
  });

  client.on('error', (error) => {
    logger.warn({ err: error }, 'Redis 客户端错误');
  });

  return client;
}

export function getRedisClient() {
  redisClient ??= createRedisClient();
  return redisClient;
}

export async function checkRedisConnection() {
  const client = getRedisClient();
  if (client.status === 'wait') await client.connect();
  await client.ping();
}

export async function disconnectRedis() {
  if (!redisClient) return;
  await redisClient.quit();
  redisClient = undefined;
}
