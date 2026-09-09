import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { disconnectQueue, getSystemQueue } from '../../src/config/queue.js';
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
    const first = await enqueueDiagnostic('queue smoke', 'queue-integration-key', queue);
    const second = await enqueueDiagnostic('queue smoke', 'queue-integration-key', queue);
    jobIds.push(first.jobId);
    expect(first.duplicate).toBe(false);
    expect(second).toEqual({ jobId: first.jobId, duplicate: true });
    const job = await queue.getJob(first.jobId);
    expect(job.opts.attempts).toBe(3);
    expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 1000 });
  });
});
