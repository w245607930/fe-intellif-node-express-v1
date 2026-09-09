import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import {
  assignmentSchema,
  idSchema,
  permissionSchema,
  rolePermissionSchema,
  roleSchema,
} from './rbac.schema.js';
import * as c from './rbac.controller.js';
export const rbacRouter = Router();
rbacRouter.use(authenticate);
rbacRouter.get('/roles', requirePermission('role:list'), c.roles);
rbacRouter.post(
  '/roles',
  requirePermission('role:update'),
  validate({ body: roleSchema }),
  c.createRole,
);
rbacRouter.patch(
  '/roles/:id',
  requirePermission('role:update'),
  validate({ params: idSchema, body: roleSchema.partial() }),
  c.updateRole,
);
rbacRouter.delete(
  '/roles/:id',
  requirePermission('role:update'),
  validate({ params: idSchema }),
  c.deleteRole,
);
rbacRouter.get('/permissions', requirePermission('role:list'), c.permissions);
rbacRouter.post(
  '/permissions',
  requirePermission('role:update'),
  validate({ body: permissionSchema }),
  c.createPermission,
);
rbacRouter.post(
  '/user-roles',
  requirePermission('role:update'),
  validate({ body: assignmentSchema }),
  c.assignRole,
);
rbacRouter.delete(
  '/user-roles',
  requirePermission('role:update'),
  validate({ body: assignmentSchema }),
  c.revokeRole,
);
rbacRouter.post(
  '/role-permissions',
  requirePermission('role:update'),
  validate({ body: rolePermissionSchema }),
  c.assignPermission,
);
rbacRouter.delete(
  '/role-permissions',
  requirePermission('role:update'),
  validate({ body: rolePermissionSchema }),
  c.revokePermission,
);
