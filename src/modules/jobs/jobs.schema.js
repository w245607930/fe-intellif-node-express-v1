import { z } from 'zod';

export const diagnosticJobSchema = z.object({
  message: z.string().trim().min(1).max(128),
});

export const idempotencyHeaderSchema = z.object({
  'idempotency-key': z.string().trim().min(8).max(128),
});
