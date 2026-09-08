import { ERROR_CODES } from '../constants/error-codes.js';
import { AppError } from '../errors/app-error.js';

const SUPPORTED_SOURCES = ['body', 'query', 'params', 'headers'];

function formatIssues(source, issues) {
  return issues.map((issue) => ({
    source,
    path: issue.path.join('.'),
    code: issue.code,
    message: issue.message,
  }));
}

export function validate(schemas) {
  const entries = SUPPORTED_SOURCES.filter((source) => schemas[source]).map((source) => [
    source,
    schemas[source],
  ]);

  return async function validationMiddleware(request, _response, next) {
    const validated = {};
    const issues = [];

    for (const [source, schema] of entries) {
      const result = await schema.safeParseAsync(request[source]);

      if (result.success) {
        validated[source] = result.data;
      } else {
        issues.push(...formatIssues(source, result.error.issues));
      }
    }

    if (issues.length > 0) {
      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: '请求参数校验失败',
        details: issues,
      });
    }

    request.validated = Object.freeze(validated);
    next();
  };
}
