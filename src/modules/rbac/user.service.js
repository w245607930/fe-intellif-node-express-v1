import { prisma } from '../../config/database.js';
export async function listUsers({ page, pageSize }) {
  const where = { deletedAt: null };
  const [list, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return { list, total, page, pageSize };
}
export function getUser(id) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      roles: { select: { role: { select: { code: true, name: true } } } },
    },
  });
}
