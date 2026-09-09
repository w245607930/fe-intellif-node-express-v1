import { prisma } from '../../config/database.js';
export const listRoles = () =>
  prisma.role.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
    include: { permissions: { include: { permission: true } } },
  });
export const createRole = (data) => prisma.role.create({ data });
export async function updateRole(id, data) {
  return prisma.role.update({ where: { id }, data });
}
export async function deleteRole(id) {
  return prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
}
export const listPermissions = () => prisma.permission.findMany({ orderBy: { code: 'asc' } });
export const createPermission = (data) => prisma.permission.create({ data });
export async function assignRole(userId, roleId) {
  return prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });
}
export async function revokeRole(userId, roleId) {
  return prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
}
