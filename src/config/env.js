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
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    REQUEST_BODY_LIMIT: z
      .string()
      .regex(/^\d+(kb|mb)$/i)
      .default('1mb'),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(30_000),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    SCHEDULER_ENABLED: z.preprocess(
      (value) => (value === 'true' ? true : value === 'false' ? false : value),
      z.boolean().default(false),
    ),
    SCHEDULER_INTERVAL_MS: z.coerce.number().int().min(60_000).default(3_600_000),
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
    if (value.NODE_ENV === 'production' && !process.env.CORS_ORIGINS?.trim())
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: 'production requires at least one CORS origin',
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
