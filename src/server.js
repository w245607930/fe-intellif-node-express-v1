import { app } from './app.js';
import { disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { disconnectRedis } from './config/redis.js';

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT }, 'HTTP 服务已启动');
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, '开始优雅关闭 HTTP 服务');

  server.close(async (error) => {
    if (error) {
      logger.error({ error }, 'HTTP 服务关闭失败');
      process.exitCode = 1;
    }

    try {
      await disconnectDatabase();
      logger.info('数据库连接已关闭');
    } catch (databaseError) {
      logger.error({ err: databaseError }, '数据库连接关闭失败');
      process.exitCode = 1;
    }

    try {
      await disconnectRedis();
      logger.info('Redis 连接已关闭');
    } catch (redisError) {
      logger.error({ err: redisError }, 'Redis 连接关闭失败');
      process.exitCode = 1;
    }
  });

  server.closeIdleConnections?.();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
