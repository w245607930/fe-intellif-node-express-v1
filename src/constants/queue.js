export const QUEUE_NAMES = Object.freeze({
  SYSTEM: 'system',
});

export const JOB_NAMES = Object.freeze({
  DIAGNOSTIC: 'diagnostic',
});

export const QUEUE_DEFAULTS = Object.freeze({
  attempts: 3,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 604_800, count: 5_000 },
});
