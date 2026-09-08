import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const [users, roles, permissions, userRoles, rolePermissions, migrations] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.userRole.count(),
    prisma.rolePermission.count(),
    prisma.$queryRaw`SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at`,
  ]);

  process.stdout.write(
    `${JSON.stringify({ users, roles, permissions, userRoles, rolePermissions, migrations })}\n`,
  );
} finally {
  await prisma.$disconnect();
}
