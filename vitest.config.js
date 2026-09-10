import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/integration/database/**'],
    setupFiles: ['./tests/setup.js'],
    env: {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-access-secret-for-vitest-only-32chars',
      CORS_ORIGINS: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/modules/auth/auth.crypto.js',
        'src/modules/auth/auth-session.service.js',
        'src/services/*.js',
        'src/utils/*.js',
        'src/middlewares/auth.js',
        'src/middlewares/error.js',
      ],
      exclude: ['**/*.controller.js', '**/*.routes.js'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
