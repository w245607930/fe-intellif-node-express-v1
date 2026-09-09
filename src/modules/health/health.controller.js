import { success } from '../../utils/response.js';
import { ERROR_CODES } from '../../constants/error-codes.js';
import { AppError } from '../../errors/app-error.js';
import { checkReadiness } from './health.service.js';

export function getLiveness(_request, response) {
  response.status(200).json(success({ status: 'ok' }));
}

export async function getReadiness(_request, response) {
  try {
    await checkReadiness();
  } catch (error) {
    throw new AppError({
      message: '依赖服务暂不可用',
      code: ERROR_CODES.REDIS_UNAVAILABLE,
      statusCode: 503,
      cause: error,
    });
  }

  response.status(200).json(success({ status: 'ready' }));
}
