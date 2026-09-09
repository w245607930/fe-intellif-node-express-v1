import { env } from './config/env.js';
import { disconnectQueue, getSystemQueue } from './config/queue.js';
import { logger } from './config/logger.js';
import { JOB_NAMES } from './constants/queue.js';

if (!env.SCHEDULER_ENABLED) {
  logger.info('queue scheduler disabled');
  await disconnectQueue();
} else {
  const queue = getSystemQueue();
  await queue.upsertJobScheduler(
    'system-diagnostic-scheduler',
    { every: env.SCHEDULER_INTERVAL_MS },
    { name: JOB_NAMES.DIAGNOSTIC, data: { message: 'scheduled diagnostic' } },
  );
  logger.info({ intervalMs: env.SCHEDULER_INTERVAL_MS }, 'queue scheduler started');

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'queue scheduler shutting down');
    await disconnectQueue();
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
