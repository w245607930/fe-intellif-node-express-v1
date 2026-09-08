export class AppError extends Error {
  constructor({ message, code, statusCode = 500, details, isOperational = true, cause }) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, AppError);
  }
}
