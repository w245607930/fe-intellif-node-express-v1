import { z } from 'zod';
export const credentialsSchema = z.object({
  username: z.string().min(3).max(64),
  email: z.string().email().max(191),
  password: z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/),
});
export const loginSchema = z.object({
  identifier: z.string().min(3).max(191),
  password: z.string().min(1).max(128),
});
export const refreshSchema = z.object({ refreshToken: z.string().min(20) });
export const logoutSchema = z.object({ refreshToken: z.string().min(20).optional() });
export const authHeaderSchema = z.object({ authorization: z.string().regex(/^Bearer\s+\S+$/i) });
