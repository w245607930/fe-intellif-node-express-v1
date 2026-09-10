import { QueueEvents, Worker } from 'bullmq';
import crypto from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  disconnectQueue,
  getQueueConnection,
  getSystemQueue,
  QUEUE_PREFIX,
} from '../../src/config/queue.js';
import { QUEUE_NAMES } from '../../src/constants/queue.js';
import { enqueueDiagnostic } from '../../src/modules/jobs/jobs.service.js';

describe('BullMQ queue integration', () => {
  let queue;
  const jobIds = [];

  beforeAll(() => {
    queue = getSystemQueue();
  });

  afterAll(async () => {
    await Promise.all(jobIds.map((jobId) => queue.remove(jobId)));
    await disconnectQueue();
  });

  it('enqueues idempotently with retry-safe defaults', async () => {
    const idempotencyKey = `queue-integration-${crypto.randomUUID()}`;
    const first = await enqueueDiagnostic('queue smoke', idempotencyKey, queue);
    const second = await enqueueDiagnostic('queue smoke', idempotencyKey, queue);
    jobIds.push(first.jobId);
    expect(first.duplicate).toBe(false);
    expect(second).toEqual({ jobId: first.jobId, duplicate: true });
    const job = await queue.getJob(first.jobId);
    expect(job.opts.attempts).toBe(3);
    expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 });
  });

  it('retries a failed job and completes it without creating a duplicate', async () => {
    const idempotencyKey = `queue-retry-${crypto.randomUUID()}`;
    let attempts = 0;
    const job = await enqueueDiagnostic('queue retry', idempotencyKey, queue);
    jobIds.push(job.jobId);
    const worker = new Worker(
      QUEUE_NAMES.SYSTEM,
      async (currentJob) => {
        if (currentJob.id !== job.jobId) return { skipped: true };
        attempts += 1;
        if (attempts < 3) throw new Error('transient failure');
        return { attempts };
      },
      { connection: getQueueConnection(), prefix: QUEUE_PREFIX, concurrency: 1 },
    );
    const events = new QueueEvents(QUEUE_NAMES.SYSTEM, {
      connection: getQueueConnection(),
      prefix: QUEUE_PREFIX,
    });

    try {
      await Promise.all([worker.waitUntilReady(), events.waitUntilReady()]);
      const queuedJob = await queue.getJob(job.jobId);
      await expect(queuedJob.waitUntilFinished(events, 10_000)).resolves.toEqual({ attempts: 3 });
      expect(attempts).toBe(3);
      const duplicate = await enqueueDiagnostic('queue retry', idempotencyKey, queue);
      expect(duplicate).toEqual({ jobId: job.jobId, duplicate: true });
    } finally {
      await events.close();
      await worker.close();
    }
  });
});
