import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
export const listRoles = () =>
  prisma.role.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
    include: { permissions: { include: { permission: true } } },
  });
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
