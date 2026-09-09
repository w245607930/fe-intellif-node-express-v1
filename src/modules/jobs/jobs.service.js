import crypto from 'node:crypto';

import { JOB_NAMES } from '../../constants/queue.js';
import { getSystemQueue } from '../../config/queue.js';

function toJobId(idempotencyKey) {
  return `${JOB_NAMES.DIAGNOSTIC}-${crypto.createHash('sha256').update(idempotencyKey).digest('hex')}`;
}

export async function enqueueDiagnostic(message, idempotencyKey, queue = getSystemQueue()) {
  const jobId = toJobId(idempotencyKey);
  const existing = await queue.getJob(jobId);
  if (existing) return { jobId: existing.id, duplicate: true };
  const job = await queue.add(JOB_NAMES.DIAGNOSTIC, { message }, { jobId });
  return { jobId: job.id, duplicate: false };
}

export { toJobId };
