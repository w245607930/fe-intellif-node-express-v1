import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    HOST: z.string().min(1).default('0.0.0.0'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DATABASE_URL: z.string().url().startsWith('mysql://').optional(),
    REDIS_URL: z.string().url().startsWith('redis://').optional(),
    REDIS_USERNAME: z.string().min(1).optional(),
    JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-32chars'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === 'production' &&
      (!process.env.JWT_ACCESS_SECRET || value.JWT_ACCESS_SECRET.includes('change-me'))
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_ACCESS_SECRET'],
        message: 'production requires an explicit JWT_ACCESS_SECRET',
      });
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  throw new Error(`环境变量校验失败：${details}`);
}

export const env = Object.freeze(result.data);
