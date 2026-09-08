import { ERROR_CODES } from '../constants/error-codes.js';
import { AppError } from '../errors/app-error.js';

export function notFoundHandler(request, _response, next) {
  next(
    new AppError({
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: '接口不存在',
      details: { method: request.method, path: request.originalUrl },
    }),
  );
}
