import { env } from '../config/env.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { AppError } from '../errors/app-error.js';
import { failure } from '../utils/response.js';

function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error?.type === 'entity.parse.failed') {
    return new AppError({
      statusCode: 400,
      code: ERROR_CODES.INVALID_REQUEST_BODY,
      message: '请求体不是有效的 JSON',
      cause: error,
    });
  }

  return new AppError({
    statusCode: 500,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: '服务器内部错误',
    isOperational: false,
    cause: error,
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const normalizedError = normalizeError(error);

  if (normalizedError.statusCode >= 500) {
    request.log.error({ err: error, code: normalizedError.code }, '请求处理失败');
  } else {
    request.log.warn(
      { code: normalizedError.code, statusCode: normalizedError.statusCode },
      '请求被拒绝',
    );
  }

  const exposeDetails = normalizedError.isOperational || env.NODE_ENV !== 'production';

  response.status(normalizedError.statusCode).json(
    failure({
      code: normalizedError.code,
      message: normalizedError.message,
      details: exposeDetails ? normalizedError.details : undefined,
      requestId: request.id,
    }),
  );
}
