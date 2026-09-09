import { z } from 'zod';
export const roleSchema = z.object({
  code: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
});
export const permissionSchema = z.object({
  code: z.string().regex(/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/),
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
});
export const idSchema = z.object({ id: z.string().min(1).max(30) });
export const assignmentSchema = z.object({
  userId: z.string().min(1).max(30),
  roleId: z.string().min(1).max(30),
});
