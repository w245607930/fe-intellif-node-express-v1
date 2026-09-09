import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../constants/error-codes.js';

export function parseAllowedOrigins(value) {
  return new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function createCorsMiddleware({ allowedOrigins }) {
  return function corsMiddleware(request, response, next) {
    const origin = request.get('origin');
    if (!origin) {
      next();
      return;
    }
    if (!allowedOrigins.has(origin)) {
      next(
        new AppError({
          statusCode: 403,
          code: ERROR_CODES.FORBIDDEN,
          message: 'Origin is not allowed',
        }),
      );
      return;
    }
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-Request-Id');
    response.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }
    next();
  };
}
