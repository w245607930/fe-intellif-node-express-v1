import { describe, expect, it, vi } from 'vitest';

import { enqueueDiagnostic, toJobId } from '../../src/modules/jobs/jobs.service.js';

describe('jobs service', () => {
  it('derives a stable non-sensitive job id', () => {
    expect(toJobId('request-123')).toBe(toJobId('request-123'));
    expect(toJobId('request-123')).not.toContain('request-123');
  });

  it('returns the existing job for duplicate idempotency keys', async () => {
    const queue = {
      getJob: vi.fn().mockResolvedValue({ id: 'diagnostic-existing' }),
      add: vi.fn(),
    };
    await expect(enqueueDiagnostic('hello', 'request-123', queue)).resolves.toEqual({
      jobId: 'diagnostic-existing',
      duplicate: true,
    });
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('enqueues a new job with a hashed idempotency key', async () => {
    const queue = {
      getJob: vi.fn().mockResolvedValue(null),
      add: vi.fn().mockResolvedValue({ id: 'diagnostic-new' }),
    };
    await expect(enqueueDiagnostic('hello', 'request-123', queue)).resolves.toEqual({
      jobId: 'diagnostic-new',
      duplicate: false,
    });
    expect(queue.add).toHaveBeenCalledWith(
      'diagnostic',
      { message: 'hello' },
      { jobId: expect.stringMatching(/^diagnostic-[a-f0-9]{64}$/) },
    );
  });
});
