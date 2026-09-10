import { Worker } from 'bullmq';

import { disconnectQueue, getQueueConnection, QUEUE_PREFIX } from './config/queue.js';
import { logger } from './config/logger.js';
import { QUEUE_NAMES } from './constants/queue.js';
import { processJob } from './modules/jobs/jobs.processor.js';

const worker = new Worker(QUEUE_NAMES.SYSTEM, processJob, {
  connection: getQueueConnection(),
  prefix: QUEUE_PREFIX,
  concurrency: 5,
});

worker.on('completed', (job) =>
  logger.info({ jobId: job.id, jobName: job.name }, 'queue job completed'),
);
worker.on('failed', (job, error) =>
  logger.error({ jobId: job?.id, jobName: job?.name, err: error }, 'queue job failed'),
);
worker.on('error', (error) => logger.error({ err: error }, 'queue worker error'));

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'queue worker shutting down');
  await worker.close();
  await disconnectQueue();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

logger.info({ queue: QUEUE_NAMES.SYSTEM, concurrency: 5 }, 'queue worker started');
