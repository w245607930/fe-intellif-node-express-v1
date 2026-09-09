import { ERROR_CODES } from '../constants/error-codes.js';
import { AppError } from '../errors/app-error.js';
import { hasPermission } from '../modules/rbac/rbac.service.js';

const PERMISSION_CODE = /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/;

export function assertPermissionCode(permissionCode) {
  if (!PERMISSION_CODE.test(permissionCode))
    throw new Error('permission code must use resource:action format');
}

export function requirePermission(permissionCode) {
  assertPermissionCode(permissionCode);
  return async function permissionMiddleware(request, _response, next) {
    if (!(await hasPermission(request.user.id, permissionCode)))
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.FORBIDDEN,
        message: 'permission denied',
      });
    next();
  };
}
