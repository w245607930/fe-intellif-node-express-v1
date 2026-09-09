import { success } from '../../utils/response.js';
import { enqueueDiagnostic } from './jobs.service.js';

export async function enqueueDiagnosticJob(request, response) {
  const result = await enqueueDiagnostic(
    request.validated.body.message,
    request.validated.headers['idempotency-key'],
  );
  response.status(result.duplicate ? 200 : 202).json(success(result, 'queued'));
}
