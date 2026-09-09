import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../errors/app-error.js';
import { ERROR_CODES } from '../../constants/error-codes.js';
export const listRoles = () =>
  prisma.role.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
    include: { permissions: { include: { permission: true } } },
  });
export async function hasPermission(userId, permissionCode) {
  const admin = await prisma.user.findFirst({
    where: {
      id: userId,
      status: 'ACTIVE',
      deletedAt: null,
      roles: { some: { role: { code: 'admin', isSystem: true, deletedAt: null } } },
    },
    select: { id: true },
  });
  if (admin) return true;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      status: 'ACTIVE',
      deletedAt: null,
      roles: {
        some: { role: { permissions: { some: { permission: { code: permissionCode } } } } },
      },
    },
    select: { id: true },
  });
  return Boolean(user);
}
export async function createRole(data) {
  const result = await prisma.role.create({ data });
  logger.info({ roleId: result.id }, 'rbac role created');
  return result;
}
export async function updateRole(id, data) {
  const result = await prisma.role.update({ where: { id }, data });
  logger.info({ roleId: id }, 'rbac role updated');
  return result;
}
export async function deleteRole(id) {
  const result = await prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
  logger.info({ roleId: id }, 'rbac role deleted');
  return result;
}
export const listPermissions = () => prisma.permission.findMany({ orderBy: { code: 'asc' } });
export async function createPermission(data) {
  const result = await prisma.permission.create({ data });
  logger.info({ permissionId: result.id }, 'rbac permission created');
  return result;
}
export async function assignPermission(roleId, permissionId) {
  const [role, permission] = await Promise.all([
    prisma.role.findFirst({ where: { id: roleId, deletedAt: null }, select: { id: true } }),
    prisma.permission.findUnique({ where: { id: permissionId }, select: { id: true } }),
  ]);
  if (!role || !permission) {
    throw new AppError({
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
      message: 'Role or permission not found',
    });
  }
  const result = await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId, permissionId } },
    update: {},
    create: { roleId, permissionId },
  });
  logger.info({ roleId, permissionId }, 'rbac permission assigned');
  return result;
}
export async function revokePermission(roleId, permissionId) {
  const result = await prisma.rolePermission.delete({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
  logger.info({ roleId, permissionId }, 'rbac permission revoked');
  return result;
}
export async function assignRole(userId, roleId) {
  const result = await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });
  logger.info({ userId, roleId }, 'rbac role assigned');
  return result;
}
export async function revokeRole(userId, roleId) {
  const result = await prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
  logger.info({ userId, roleId }, 'rbac role revoked');
  return result;
}
