import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import { diagnosticJobSchema, idempotencyHeaderSchema } from './jobs.schema.js';
import { enqueueDiagnosticJob } from './jobs.controller.js';

export const jobsRouter = Router();
jobsRouter.post(
  '/diagnostic',
  authenticate,
  requirePermission('role:update'),
  validate({ body: diagnosticJobSchema, headers: idempotencyHeaderSchema }),
  enqueueDiagnosticJob,
);
