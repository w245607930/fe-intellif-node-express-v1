import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../constants/error-codes.js';

export function createRequestTimeoutMiddleware(timeoutMs) {
  return function requestTimeoutMiddleware(request, response, next) {
    request.setTimeout(timeoutMs, () => {
      if (!response.headersSent)
        next(
          new AppError({
            statusCode: 503,
            code: ERROR_CODES.REQUEST_TIMEOUT,
            message: 'Request timed out',
          }),
        );
    });
    next();
  };
}
