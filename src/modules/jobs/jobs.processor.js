import { JOB_NAMES } from '../../constants/queue.js';

export async function processJob(job) {
  if (job.name !== JOB_NAMES.DIAGNOSTIC) throw new Error(`Unsupported job: ${job.name}`);
  if (!job.data?.message) throw new Error('Diagnostic job message is required');
  return { accepted: true, jobId: job.id };
}
