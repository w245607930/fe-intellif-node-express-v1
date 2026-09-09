import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { prisma } from '../config/database.js';

const PERMISSION_CODE = /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/;

export function assertPermissionCode(permissionCode) {
  if (!PERMISSION_CODE.test(permissionCode))
    throw new Error('permission code must use resource:action format');
}

export function requirePermission(permissionCode) {
  assertPermissionCode(permissionCode);
  return async function permissionMiddleware(request, _response, next) {
    const user = await prisma.user.findFirst({
      where: {
        id: request.user.id,
        status: 'ACTIVE',
        deletedAt: null,
        roles: {
          some: { role: { permissions: { some: { permission: { code: permissionCode } } } } },
        },
      },
      select: { id: true },
    });
    if (!user)
      throw new AppError({ statusCode: 403, code: ERROR_CODES.FORBIDDEN, message: '权限不足' });
    next();
  };
}
