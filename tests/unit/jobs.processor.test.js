import { describe, expect, it } from 'vitest';

import { JOB_NAMES } from '../../src/constants/queue.js';
import { processJob } from '../../src/modules/jobs/jobs.processor.js';

describe('jobs processor', () => {
  it('processes the diagnostic payload', async () => {
    await expect(
      processJob({ id: 'job-1', name: JOB_NAMES.DIAGNOSTIC, data: { message: 'ok' } }),
    ).resolves.toEqual({
      accepted: true,
      jobId: 'job-1',
    });
  });

  it('rejects unsupported jobs and malformed payloads', async () => {
    await expect(processJob({ id: 'job-2', name: 'unknown', data: {} })).rejects.toThrow(
      'Unsupported job',
    );
    await expect(processJob({ id: 'job-3', name: JOB_NAMES.DIAGNOSTIC, data: {} })).rejects.toThrow(
      'message is required',
    );
  });
});
