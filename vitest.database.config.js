import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/database/**/*.test.js'],
    fileParallelism: false,
    setupFiles: ['./tests/setup.js'],
  },
});
